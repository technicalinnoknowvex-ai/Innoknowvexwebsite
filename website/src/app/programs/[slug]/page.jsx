import { getPublicProgram, getSiteUrl } from "../../../lib/seo";
import ProgramDetails from "../../../features/programs/ProgramDetails";

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let program = null;
  let programNotFound = false;

  try {
    program = await getPublicProgram(slug);
    programNotFound = program === null;
  } catch (error) {
    console.error("Could not load program metadata:", error);
  }

  const title = program?.title || titleFromSlug(slug);
  const description =
    program?.shortDescription ||
    `Explore the ${title} training program from Innoknowvex, including practical learning and career-focused skills.`;

  let image;
  if (program?.imageUrl) {
    try {
      image = new URL(program.imageUrl, getSiteUrl()).toString();
    } catch {
      console.warn(`Ignoring invalid program image URL for slug "${slug}".`);
    }
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/programs/${encodeURIComponent(slug)}`,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/programs/${encodeURIComponent(slug)}`,
      ...(image ? { images: [image] } : {}),
    },
    ...(programNotFound
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {
          robots: {
            index: true,
            follow: true,
          },
        }),
  };
}

export default async function ProgramDetailsPage({ params }) {
  const { slug } = await params;
  let program = null;

  try {
    program = await getPublicProgram(slug);
  } catch (error) {
    console.error("Could not load program structured data:", error);
  }

  const programSchema = program
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: program.title || titleFromSlug(slug),
        ...(program.shortDescription ? { description: program.shortDescription } : {}),
        provider: {
          "@type": "Organization",
          name: "Innoknowvex",
          url: getSiteUrl(),
        },
      }
    : null;

  return (
    <>
      {programSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(programSchema) }}
        />
      ) : null}
      <ProgramDetails slug={slug} />
    </>
  );
}
