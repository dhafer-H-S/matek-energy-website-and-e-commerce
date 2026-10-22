"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link2, Check, MessageCircle } from "lucide-react";
import {
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from "@/components/site/BrandIcons";

/**
 * Social share row for a blog article. Builds share URLs from the current
 * page location on the client so it works for any post without extra data.
 */
export function ShareButtons({ title }: { title: string }) {
  const t = useTranslations("blog");
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      Icon: FacebookIcon,
    },
    {
      key: "twitter",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: TwitterIcon,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedinIcon,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      Icon: MessageCircle,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-luxe text-muted">
        {t("share")}
      </span>
      <div className="flex items-center gap-2">
        {links.map(({ key, label, href, Icon }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-gold hover:bg-gold hover:text-ink"
          >
            <Icon className="h-4 w-4" />
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label={t("copyLink")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-gold hover:bg-gold hover:text-ink"
        >
          {copied ? (
            <Check className="h-4 w-4" strokeWidth={2} />
          ) : (
            <Link2 className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </div>
  );
}
