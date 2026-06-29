import { REDDIT_ENABLED } from './config';

export type PlatformKey = 'instagram' | 'facebook' | 'youtube' | 'linkedin' | 'linkedin_page' | 'twitter' | 'reddit';

export interface Platform {
  key: PlatformKey;
  label: string;
  description: string;
  color: string;           // Tailwind bg class for icon bg
  textColor: string;       // Tailwind text class
  borderColor: string;     // Tailwind border class
  scopes: string[];        // Human-readable scopes shown to user
}

export const PLATFORMS: Record<PlatformKey, Platform> = {
  instagram: {
    key: 'instagram',
    label: 'Instagram',
    description: 'Connect your Instagram Business or Creator account to share profile data and analytics.',
    color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    scopes: ['Profile & bio', 'Follower count', 'Post performance', 'Audience insights'],
  },
  facebook: {
    key: 'facebook',
    label: 'Facebook',
    description: 'Connect your Facebook Page to share page metrics and linked Instagram accounts.',
    color: 'bg-blue-600',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    scopes: ['Page profile', 'Fan count', 'Post reach', 'Linked Instagram accounts'],
  },
  youtube: {
    key: 'youtube',
    label: 'YouTube',
    description: 'Connect your YouTube channel to share subscriber count and video analytics.',
    color: 'bg-red-600',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    scopes: ['Channel profile', 'Subscriber count', 'Video performance', 'Watch time analytics'],
  },
  linkedin: {
    key: 'linkedin',
    label: 'LinkedIn',
    description: 'Connect your personal LinkedIn profile to schedule and publish posts.',
    color: 'bg-sky-700',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    scopes: ['Profile info', 'Publish posts to your profile'],
  },
  linkedin_page: {
    key: 'linkedin_page',
    label: 'LinkedIn Page',
    description: 'Connect a LinkedIn Company/Showcase Page you administer to post, manage comments and view insights.',
    color: 'bg-sky-700',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    scopes: ['Page posting', 'Comments management', 'Follower & post insights'],
  },
  twitter: {
    key: 'twitter',
    label: 'Twitter / X',
    description: 'Connect your Twitter/X account to share follower metrics and tweet analytics.',
    color: 'bg-slate-800',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-500/30',
    scopes: ['Profile info', 'Follower count', 'Tweet reach', 'Engagement metrics'],
  },
  reddit: {
    key: 'reddit',
    label: 'Reddit',
    description: 'Connect your Reddit account to post to subreddits and manage comments.',
    color: 'bg-orange-600',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    scopes: ['Identity', 'Submit posts', 'Read & reply to comments'],
  },
};

// Reddit is gated by REDDIT_ENABLED — hidden from the picker until enabled.
export const PLATFORM_ORDER: PlatformKey[] = (
  ['instagram', 'facebook', 'youtube', 'linkedin', 'linkedin_page', 'twitter', 'reddit'] as PlatformKey[]
).filter((p) => p !== 'reddit' || REDDIT_ENABLED);
