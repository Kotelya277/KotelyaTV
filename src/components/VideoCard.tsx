/* eslint-disable @typescript-eslint/no-explicit-any */

import { CheckCircle, Heart, Link, PlayCircleIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  deleteFavorite,
  deletePlayRecord,
  generateStorageKey,
  isFavorited,
  saveFavorite,
  subscribeToDataUpdates,
} from '@/lib/db.client';
import { SearchResult } from '@/lib/types';
import { processImageUrl } from '@/lib/utils';

import { ImagePlaceholder } from '@/components/ImagePlaceholder';
import { fetchVideoDetail } from '@/lib/fetchVideoDetail';

interface VideoCardProps {
  id?: string;
  source?: string;
  title?: string;
  query?: string;
  poster?: string;
  episodes?: number;
  source_name?: string;
  progress?: number;
  year?: string;
  from: 'playrecord' | 'favorite' | 'search' | 'douban';
  currentEpisode?: number;
  douban_id?: number;
  onDelete?: () => void;
  rate?: string;
  items?: SearchResult[];
  type?: string;
}

export default function VideoCard({
  id,
  title = '',
  query = '',
  poster = '',
  episodes,
  source,
  source_name,
  progress = 0,
  year,
  from,
  currentEpisode,
  douban_id,
  onDelete,
  rate,
  items,
  type = '',
}: VideoCardProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [detailDesc, setDetailDesc] = useState<string>('');
  const [detailLoading, setDetailLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const isAggregate = from === 'search' && !!items?.length;

  const aggregateData = useMemo(() => {
    if (!isAggregate || !items) return null;
    const countMap = new Map<number, number>();
    const episodeCountMap = new Map<number, number>();
    items.forEach((item) => {
      if (item.douban_id && item.douban_id !== 0) {
        countMap.set(item.douban_id, (countMap.get(item.douban_id) || 0) + 1);
      }
      const len = item.episodes?.length || 0;
      if (len > 0) {
        episodeCountMap.set(len, (episodeCountMap.get(len) || 0) + 1);
      }
    });

    const getMostFrequent = (map: Map<number, number>) => {
      let maxCount = 0;
      let result: number | undefined;
      map.forEach((cnt, key) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          result = key;
        }
      });
      return result;
    };

    return {
      first: items[0],
      mostFrequentDoubanId: getMostFrequent(countMap),
      mostFrequentEpisodes: getMostFrequent(episodeCountMap) || 0,
    };
  }, [isAggregate, items]);

  const actualTitle = aggregateData?.first.title ?? title;
  const actualPoster = aggregateData?.first.poster ?? poster;
  const actualSource = aggregateData?.first.source ?? source;
  const actualId = aggregateData?.first.id ?? id;
  const actualDoubanId = aggregateData?.mostFrequentDoubanId ?? douban_id;
  const actualEpisodes = aggregateData?.mostFrequentEpisodes ?? episodes;
  const actualYear = aggregateData?.first.year ?? year;
  const actualQuery = query || '';
  const actualSearchType = isAggregate
    ? aggregateData?.first.episodes?.length === 1
      ? 'movie'
      : 'tv'
    : type;

  // 获取收藏状态
  useEffect(() => {
    if (from === 'douban' || !actualSource || !actualId) return;

    const fetchFavoriteStatus = async () => {
      try {
        const fav = await isFavorited(actualSource, actualId);
        setFavorited(fav);
      } catch (err) {
        throw new Error('检查收藏状态失败');
      }
    };

    fetchFavoriteStatus();

    // 监听收藏状态更新事件
    const storageKey = generateStorageKey(actualSource, actualId);
    const unsubscribe = subscribeToDataUpdates(
      'favoritesUpdated',
      (newFavorites: Record<string, any>) => {
        // 检查当前项目是否在新的收藏列表中
        const isNowFavorited = !!newFavorites[storageKey];
        setFavorited(isNowFavorited);
      }
    );

    return unsubscribe;
  }, [from, actualSource, actualId]);

  const handleToggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (from === 'douban' || !actualSource || !actualId) return;
      try {
        if (favorited) {
          // 如果已收藏，删除收藏
          await deleteFavorite(actualSource, actualId);
          setFavorited(false);
        } else {
          // 如果未收藏，添加收藏
          await saveFavorite(actualSource, actualId, {
            title: actualTitle,
            source_name: source_name || '',
            year: actualYear || '',
            cover: actualPoster,
            total_episodes: actualEpisodes ?? 1,
            save_time: Date.now(),
          });
          setFavorited(true);
        }
      } catch (err) {
        throw new Error('切换收藏状态失败');
      }
    },
    [
      from,
      actualSource,
      actualId,
      actualTitle,
      source_name,
      actualYear,
      actualPoster,
      actualEpisodes,
      favorited,
    ]
  );

  const handleDeleteRecord = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (from !== 'playrecord' || !actualSource || !actualId) return;
      try {
        await deletePlayRecord(actualSource, actualId);
        onDelete?.();
      } catch (err) {
        throw new Error('删除播放记录失败');
      }
    },
    [from, actualSource, actualId, onDelete]
  );

  const goPlay = useCallback(() => {
    if (from === 'douban') {
      router.push(
        `/play?title=${encodeURIComponent(actualTitle.trim())}${actualYear ? `&year=${actualYear}` : ''}${actualSearchType ? `&stype=${actualSearchType}` : ''}`
      );
    } else if (actualSource && actualId) {
      router.push(
        `/play?source=${actualSource}&id=${actualId}&title=${encodeURIComponent(actualTitle)}${actualYear ? `&year=${actualYear}` : ''}${isAggregate ? '&prefer=true' : ''}${actualQuery ? `&stitle=${encodeURIComponent(actualQuery.trim())}` : ''}${actualSearchType ? `&stype=${actualSearchType}` : ''}`
      );
    }
  }, [from, actualSource, actualId, router, actualTitle, actualYear, isAggregate, actualQuery, actualSearchType]);

  const handleClick = useCallback(() => {
    // 不再直接跳转，改为打开预览卡片
    setPreviewOpen(true);
    // 下一帧开启可见动画，避免闪烁
    requestAnimationFrame(() => setPreviewVisible(true));
    // 在打开时加载详情简介
    if (actualSource && actualId) {
      setDetailLoading(true);
      fetchVideoDetail({ source: actualSource, id: actualId, fallbackTitle: actualTitle })
        .then((res) => {
          setDetailDesc(res.desc || '');
        })
        .catch(() => {})
        .finally(() => setDetailLoading(false));
    }
  }, []);

  // 焦点陷阱：在预览开启时，将焦点限制在对话框内部
  useEffect(() => {
    if (!previewOpen) return;
    const dialog = modalRef.current;
    if (!dialog) return;

    const selector = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.hasAttribute('disabled'));
    // 初始聚焦第一个可聚焦元素
    focusables[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewVisible(false);
        setTimeout(() => setPreviewOpen(false), 200);
        return;
      }
      if (e.key === 'Tab') {
        if (focusables.length === 0) return;
        const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
        let nextIndex = currentIndex;
        if (e.shiftKey) {
          nextIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
        } else {
          nextIndex = currentIndex === focusables.length - 1 ? 0 : currentIndex + 1;
        }
        focusables[nextIndex]?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [previewOpen]);

  const config = useMemo(() => {
    const configs = {
      playrecord: {
        showSourceName: true,
        showProgress: true,
        showPlayButton: true,
        showHeart: true,
        showCheckCircle: true,
        showDoubanLink: false,
        showRating: false,
      },
      favorite: {
        showSourceName: true,
        showProgress: false,
        showPlayButton: true,
        showHeart: true,
        showCheckCircle: false,
        showDoubanLink: false,
        showRating: false,
      },
      search: {
        showSourceName: true,
        showProgress: false,
        showPlayButton: true,
        showHeart: !isAggregate,
        showCheckCircle: false,
        showDoubanLink: !!actualDoubanId,
        showRating: false,
      },
      douban: {
        showSourceName: false,
        showProgress: false,
        showPlayButton: true,
        showHeart: false,
        showCheckCircle: false,
        showDoubanLink: true,
        showRating: !!rate,
      },
    };
    return configs[from] || configs.search;
  }, [from, isAggregate, actualDoubanId, rate]);

  return (
    <div
      className='group relative w-full rounded-lg bg-transparent cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.05] hover:z-[500]'
      onClick={handleClick}
      tabIndex={0}
      role='button'
      aria-label={`打开 ${actualTitle} 预览`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
        // 简易左右导航：在卡片容器同级间移动焦点
        if (e.key === 'ArrowRight') {
          (e.currentTarget.parentElement?.nextElementSibling as HTMLElement | null)?.querySelector('[role="button"]')?.focus();
        }
        if (e.key === 'ArrowLeft') {
          (e.currentTarget.parentElement?.previousElementSibling as HTMLElement | null)?.querySelector('[role="button"]')?.focus();
        }
      }}
    >
      {/* 海报容器 */}
      <div className='relative aspect-[2/3] overflow-hidden rounded-lg'>
        {/* 骨架屏 */}
        {!isLoading && <ImagePlaceholder aspectRatio='aspect-[2/3]' />}
        {/* 图片 */}
        <Image
          src={processImageUrl(actualPoster)}
          alt={actualTitle}
          fill
          className='object-cover'
          referrerPolicy='no-referrer'
          loading='lazy'
          onLoadingComplete={() => setIsLoading(true)}
          onError={(e) => {
            // 图片加载失败时的重试机制
            const img = e.target as HTMLImageElement;
            if (!img.dataset.retried) {
              img.dataset.retried = 'true';
              setTimeout(() => {
                img.src = processImageUrl(actualPoster);
              }, 2000);
            }
          }}
        />

        {/* 悬浮遮罩 */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100' />

        {/* 播放按钮 */}
        {config.showPlayButton && (
          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 ease-in-out delay-75 group-hover:opacity-100 group-hover:scale-100'>
            <PlayCircleIcon
              size={50}
              strokeWidth={0.8}
              className='text-white fill-transparent transition-all duration-300 ease-out hover:fill-green-500 hover:scale-[1.1]'
            />
          </div>
        )}

        {/* 操作按钮 */}
        {(config.showHeart || config.showCheckCircle) && (
          <div className='absolute bottom-3 right-3 flex gap-3 opacity-0 translate-y-2 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-y-0'>
            {config.showCheckCircle && (
              <CheckCircle
                onClick={handleDeleteRecord}
                size={20}
                className='text-white transition-all duration-300 ease-out hover:stroke-green-500 hover:scale-[1.1]'
              />
            )}
            {config.showHeart && (
              <Heart
                onClick={handleToggleFavorite}
                size={20}
                className={`transition-all duration-300 ease-out ${favorited
                    ? 'fill-red-600 stroke-red-600'
                    : 'fill-transparent stroke-white hover:stroke-red-400'
                  } hover:scale-[1.1]`}
              />
            )}
          </div>
        )}

        {/* 徽章 */}
        {config.showRating && rate && (
          <div className='absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-out group-hover:scale-110'>
            {rate}
          </div>
        )}

        {actualEpisodes && actualEpisodes > 1 && (
          <div className='absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md transition-all duration-300 ease-out group-hover:scale-110'>
            {currentEpisode
              ? `${currentEpisode}/${actualEpisodes}`
              : actualEpisodes}
          </div>
        )}

        {/* 豆瓣链接 */}
        {config.showDoubanLink && actualDoubanId && actualDoubanId !== 0 && (
          <a
            href={`https://movie.douban.com/subject/${actualDoubanId.toString()}`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
            className='absolute top-2 left-2 opacity-0 -translate-x-2 transition-all duration-300 ease-in-out delay-100 group-hover:opacity-100 group-hover:translate-x-0'
          >
            <div className='bg-green-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 hover:scale-[1.1] transition-all duration-300 ease-out'>
              <Link size={16} />
            </div>
          </a>
        )}
      </div>

      {/* 进度条 */}
      {config.showProgress && progress !== undefined && (
        <div className='mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden'>
          <div
            className='h-full bg-green-500 transition-all duration-500 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 标题与来源 */}
      <div className='mt-2 text-center'>
        <div className='relative'>
          <span className='block text-sm font-semibold truncate text-gray-900 dark:text-gray-100 transition-colors duration-300 ease-in-out group-hover:text-green-600 dark:group-hover:text-green-400 peer'>
            {actualTitle}
          </span>
          {/* 自定义 tooltip */}
          <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-all duration-200 ease-out delay-100 whitespace-nowrap pointer-events-none'>
            {actualTitle}
            <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800'></div>
          </div>
        </div>
        {config.showSourceName && source_name && (
          <span className='block text-xs text-gray-500 dark:text-gray-400 mt-1'>
            <span className='inline-block border rounded px-2 py-0.5 border-gray-500/60 dark:border-gray-400/60 transition-all duration-300 ease-in-out group-hover:border-green-500/60 group-hover:text-green-600 dark:group-hover:text-green-400'>
              {source_name}
            </span>
          </span>
        )}
      </div>

      {/* 预览卡片（Netflix 风） */}
      {previewOpen && (
        <div
          className='fixed inset-0 z-[900] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
          onClick={() => {
            setPreviewVisible(false);
            setTimeout(() => setPreviewOpen(false), 200);
          }}
        >
          <div
            ref={modalRef}
            role='dialog'
            aria-modal='true'
            aria-label={`${actualTitle} 预览`}
            className={`relative w-full md:max-w-3xl bg-white/80 dark:bg-zinc-900/80 md:rounded-2xl rounded-t-2xl shadow-2xl border border-white/10 dark:border-white/10 overflow-hidden transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${previewVisible ? 'opacity-100 md:scale-100 translate-y-0' : 'opacity-0 md:scale-95 translate-y-4'} md:bottom-auto md:left-auto md:right-auto md:top-auto bottom-0 md:relative`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              className='absolute top-3 right-3 p-2 rounded-full bg-white/70 dark:bg-zinc-800/70 border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-zinc-700/80 transition'
              onClick={() => setPreviewOpen(false)}
              aria-label='关闭'
            >
              <X className='w-5 h-5 text-gray-700 dark:text-gray-200' />
            </button>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-0'>
              {/* 左侧海报 */}
              <div className='md:col-span-1 relative aspect-[2/3] bg-black/10'>
                <Image
                  src={processImageUrl(actualPoster)}
                  alt={actualTitle}
                  fill
                  className='object-cover'
                />
              </div>

              {/* 右侧信息 */}
              <div className='md:col-span-2 p-5 md:p-6 flex flex-col gap-4'>
                <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{actualTitle}</h3>
                <div className='flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400'>
                  {actualYear && <span>{actualYear}</span>}
                  {rate && <span className='px-2 py-0.5 rounded bg-green-500 text-white text-xs'>评分 {rate}</span>}
                  {source_name && <span className='border border-gray-500/50 rounded px-2 py-0.5'>{source_name}</span>}
                </div>

                {/* 剧情简介 */}
                {(detailDesc || detailLoading) && (
                  <div className='text-sm leading-relaxed text-gray-800 dark:text-gray-200 max-h-24 overflow-y-auto pr-1'>
                    {detailLoading ? '加载简介中…' : (detailDesc || '')}
                  </div>
                )}

                {/* 选集（聚合搜索时显示简单的选集列表） */}
                {isAggregate && aggregateData?.first?.episodes && aggregateData.first.episodes.length > 1 && (
                  <div>
                    <h4 className='text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200'>选集</h4>
                    <div className='grid grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-1'>
                      {aggregateData.first.episodes.map((ep, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            // 跳转播放并偏好聚合
                            router.push(
                              `/play?source=${aggregateData.first.source}&id=${aggregateData.first.id}&title=${encodeURIComponent(actualTitle)}${actualYear ? `&year=${actualYear}` : ''}&prefer=true${actualSearchType ? `&stype=${actualSearchType}` : ''}`
                            );
                          }}
                          className='text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition'
                        >
                          {aggregateData.first.episodes_titles?.[idx] || `第${idx + 1}集`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className='mt-2 flex gap-3 flex-wrap'>
                  <button
                    onClick={goPlay}
                    className='px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition shadow'
                  >
                    立即播放
                  </button>
                  <button
                    onClick={() => {
                      // 进入播放页提供换源入口
                      router.push(
                        `/play?source=${actualSource || aggregateData?.first?.source}&id=${actualId || aggregateData?.first?.id}&title=${encodeURIComponent(actualTitle)}${actualYear ? `&year=${actualYear}` : ''}&prefer=true${actualSearchType ? `&stype=${actualSearchType}` : ''}`
                      );
                    }}
                    className='px-4 py-2 rounded-lg bg-white/70 dark:bg-zinc-800/70 border border-white/20 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-zinc-700/80 transition'
                  >
                    换源/更多
                  </button>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className='px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition'
                  >
                    取消
                  </button>
                </div>
                {/* 更多来源列表（聚合搜索时） */}
                {isAggregate && items && items.length > 1 && (
                  <div className='mt-3'>
                    <h4 className='text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200'>更多来源</h4>
                    <div className='flex flex-wrap gap-2 max-h-16 overflow-y-auto'>
                      {Array.from(
                        new Map(
                          items.map((it) => [it.source + ':' + it.id, it])
                        ).values()
                      )
                        .slice(0, 12)
                        .map((it, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              router.push(
                                `/play?source=${it.source}&id=${it.id}&title=${encodeURIComponent(actualTitle)}${actualYear ? `&year=${actualYear}` : ''}${actualSearchType ? `&stype=${actualSearchType}` : ''}`
                              );
                            }}
                            className='text-xs px-2 py-1 rounded bg-white/70 dark:bg-zinc-800/70 border border-white/20 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-zinc-700/80 transition'
                            title={it.source_name}
                          >
                            {it.source_name || it.source}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
