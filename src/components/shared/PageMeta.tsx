import { Helmet } from "react-helmet-async";

const SITE = "https://intellidesk.lovable.app";

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
}

export function PageMeta({ title, description, path }: PageMetaProps) {
  const url = `${SITE}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
