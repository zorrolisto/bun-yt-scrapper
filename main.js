const { write, stdout } = Bun;
const BunYoutubeScraper = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw Error("Scrape shield encountered!");
  const tags = [];
  const tagsList = [
    'meta[name="title"]',
    'meta[property="og:image"]',
    'meta[name="description"]',
    'meta[name="keywords"]',
    'meta[itemprop="datePublished"]',
    'meta[itemprop="uploadDate"]',
    'meta[itemprop="videoId"]',
  ];
  const html = new HTMLRewriter()
    .on(tagsList, {
      element(el) {
        tags.push(el.getAttribute("content"));
      },
    })
    .transform(response)
    .text();
  const [
    title,
    description,
    keywords,
    videoThumbnail,
    videoId,
    uploadDate,
    datePublished,
  ] = tags;
  const htmlParsed = await html;
  const getFirstMatchedFromHtml = (regexString) =>
    htmlParsed.match(regexString)[0];
  const viewCount = getFirstMatchedFromHtml(
    /{"viewCount":{"simpleText":"(.*?)"/g
  ).split('"')[5];
  const likesCount = getFirstMatchedFromHtml(
    /defaultText":{"accessibility":{"accessibilityData":{"label":"(.*?)"/g
  ).split('"')[8];
  const approxDurationMs = getFirstMatchedFromHtml(/approxDurationMs":"(.*?)"/g)
    .split(":")[1]
    .split('"')[1];
  const largeDescription = getFirstMatchedFromHtml(
    /description":{"simpleText":"(.*?)"/g
  )
    .split('"')[4]
    .replace(/\\n/g, " ")
    .replace(/\\"/g, '"');
  const videoDataObject = {
    url,
    title,
    videoId,
    videoThumbnail,
    description,
    largeDescription,
    keywords,
    uploadDate,
    datePublished,
    approxDurationMs,
    viewCount,
    likesCount,
  };
  write(Bun.stdout, JSON.stringify(videoDataObject, null, 2));
};
await BunYoutubeScraper("https://www.youtube.com/watch?v=E20G25SCAEg");
