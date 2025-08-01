export default function StructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NIA INTERNATIONAL",
    "alternateName": "니아 인터내셔널",
    "url": "https://k-fashions.com",
    "logo": "https://k-fashions.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+82-1544-7734",
      "contactType": "customer service",
      "availableLanguage": ["Korean", "English", "Chinese"],
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "17:30"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "논현로102길 5, 4층",
      "addressLocality": "강남구",
      "addressRegion": "서울특별시",
      "addressCountry": "KR"
    },
    "founder": {
      "@type": "Person",
      "name": "윤지언"
    },
    "foundingDate": "2020",
    "description": "NIA INTERNATIONAL은 한국 패션의 우수성을 세계에 알리는 프리미엄 B2B 도매 플랫폼입니다.",
    "industry": "Fashion Wholesale",
    "numberOfEmployees": "10-50",
    "sameAs": [
      "https://www.facebook.com/niainternational",
      "https://www.instagram.com/nia_international",
      "https://www.linkedin.com/company/nia-international",
      "https://www.youtube.com/@niainternational",
      "https://pf.kakao.com/_NiaInt"
    ]
  }

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "NIA INTERNATIONAL",
    "url": "https://k-fashions.com",
    "description": "한국 패션 B2B 도매 플랫폼",
    "inLanguage": "ko",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://k-fashions.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  const businessData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://k-fashions.com/#business",
    "name": "NIA INTERNATIONAL",
    "image": "https://k-fashions.com/logo.png",
    "telephone": "+82-1544-7734",
    "email": "master@k-fashions.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "논현로102길 5, 4층",
      "addressLocality": "강남구",
      "addressRegion": "서울특별시",
      "postalCode": "06234",
      "addressCountry": "KR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.5172,
      "longitude": 127.0473
    },
    "url": "https://k-fashions.com",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "17:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "13:00"
      }
    ],
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessData),
        }}
      />
    </>
  )
}