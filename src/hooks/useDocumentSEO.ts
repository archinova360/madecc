import { useEffect } from "react";

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

export function useDocumentSEO({ title, description, keywords, ogImage }: SEOProps) {
  useEffect(() => {
    // 1. Update document title
    document.title = title;

    // 2. Update dynamic description meta tag
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // 3. Update dynamic keywords meta tag
    let metaKey = document.querySelector('meta[name="keywords"]');
    if (!metaKey) {
      metaKey = document.createElement("meta");
      metaKey.setAttribute("name", "keywords");
      document.head.appendChild(metaKey);
    }
    metaKey.setAttribute(
      "content",
      keywords ||
        "construction, engineering, vertical construction, horizontal infrastructure, MADECC, building, architecture, sustainable infrastructure, Cameroon construction, Yaounde contractors, Douala builder, civil works Africa"
    );

    // 4. Update OpenGraph meta title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title);
    }

    // 5. Update OpenGraph meta description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", description);
    }

    // 6. Update OpenGraph meta image
    if (ogImage) {
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) {
        ogImg.setAttribute("content", ogImage);
      }
    }
  }, [title, description, keywords, ogImage]);
}
