import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    schema?: any;
}

export const SEO = ({
    title = "Daru Hunting | Premium Spirits & Adventure Delivered",
    description = "Join the hunt for the finest international whiskeys, local spirits, and savory snacks. Daru Hunting delivers to your doorstep across Kathmandu in under 30 minutes.",
    keywords = "liquor delivery Kathmandu, alcohol delivery Nepal, whiskey delivery, wine delivery, snacks delivery Kathmandu, Daru Hunting, local spirits Nepal",
    image = "/logo.png",
    url = "https://daruhunting.com.np",
    type = "website",
    schema
}: SEOProps) => {
    const siteTitle = title.includes("Daru Hunting") ? title : `${title} | Daru Hunting`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={url} />
            <html lang="en-NP" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="Daru Hunting" />
            <meta property="og:locale" content="en_NP" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <meta name="twitter:site" content="@daruhunting" />

            {/* Structured Data (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}

            {/* Business Local Schema */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "LiquorStore",
                    "name": "Daru Hunting",
                    "image": "https://daruhunting.com.np/logo.png",
                    "@id": "https://daruhunting.com.np",
                    "url": "https://daruhunting.com.np",
                    "telephone": "+977 9769919699",
                    "priceRange": "$$",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Thamel",
                        "addressLocality": "Kathmandu",
                        "postalCode": "44600",
                        "addressCountry": "NP"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": 27.7154,
                        "longitude": 85.3123
                    },
                    "openingHoursSpecification": {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": [
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday"
                        ],
                        "opens": "09:00",
                        "closes": "23:59"
                    }
                })}
            </script>
        </Helmet>
    );
};
