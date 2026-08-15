const applicationTitle = "影像档案架";
const maxPageTitleLength = 60;

function formatPageTitle(title?: string | null) {
  const normalizedTitle = title?.trim();
  if (!normalizedTitle) return applicationTitle;

  const shortenedTitle =
    normalizedTitle.length > maxPageTitleLength
      ? `${normalizedTitle.slice(0, maxPageTitleLength - 1)}…`
      : normalizedTitle;

  return `${shortenedTitle} - ${applicationTitle}`;
}

export default function PageTitle({ title }: { title?: string | null }) {
  return <title>{formatPageTitle(title)}</title>;
}
