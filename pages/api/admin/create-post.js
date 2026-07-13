import {
  ADMIN_SESSION_COOKIE_NAME,
  hasValidAdminSession,
} from '../../../lib/admin-auth';

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function sanitizeImageName(fileName) {
  const cleaned = String(fileName ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^[-.]+|[-.]+$/g, '');

  return cleaned;
}

function parseBase64Image(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return null;
  }

  const base64Match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!base64Match) {
    return null;
  }

  const mimeType = base64Match[1];
  const base64Payload = base64Match[2];

  const mimeToExtension = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
  };

  const extension = mimeToExtension[mimeType];

  if (!extension) {
    return null;
  }

  return { extension, base64Payload };
}

function getGitHubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    return null;
  }

  return { token, owner, repo, branch };
}

async function githubFileExists(config, filePath) {
  const { token, owner, repo, branch } = config;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  return response.status === 200;
}

async function githubCreateFile(config, filePath, base64Content, commitMessage) {
  const { token, owner, repo, branch } = config;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: commitMessage, content: base64Content, branch }),
  });

  return response;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const sessionToken = req.cookies?.[ADMIN_SESSION_COOKIE_NAME];

  if (!hasValidAdminSession(sessionToken)) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  const githubConfig = getGitHubConfig();

  if (!githubConfig) {
    return res.status(500).json({ message: 'GitHub environment variables are not configured.' });
  }

  const {
    title,
    slug: providedSlug,
    excerpt,
    content,
    image,
    imageBase64,
    date,
    isFeatured = false,
  } = req.body ?? {};

  const generatedSlug = slugify(providedSlug || title);

  if (!title || !excerpt || !content || !generatedSlug) {
    return res.status(422).json({
      message: 'Title, excerpt, content and a valid slug are required.',
    });
  }

  const safeDate = isValidDate(date)
    ? date
    : new Date().toISOString().slice(0, 10);
  const parsedImage = parseBase64Image(imageBase64);
  const requestedImageName = sanitizeImageName(image);

  let imageFile = requestedImageName;

  if (!imageFile && parsedImage) {
    imageFile = `${generatedSlug}.${parsedImage.extension}`;
  }

  if (!imageFile) {
    imageFile = `${generatedSlug}.png`;
  }

  const postGitHubPath = `posts/${generatedSlug}.md`;
  const imageGitHubPath = `public/images/posts/${generatedSlug}/${imageFile}`;

  const postExists = await githubFileExists(githubConfig, postGitHubPath);

  if (postExists) {
    return res.status(409).json({ message: 'A post with this slug already exists.' });
  }

  const frontMatter = [
    '---',
    `title: ${JSON.stringify(String(title).trim())}`,
    `date: ${JSON.stringify(safeDate)}`,
    `image: ${JSON.stringify(imageFile)}`,
    `excerpt: ${JSON.stringify(String(excerpt).trim())}`,
    `isFeatured: ${Boolean(isFeatured)}`,
    '---',
    '',
  ].join('\n');

  const markdownBody = `${frontMatter}\n${String(content).trim()}\n`;
  const markdownBase64 = Buffer.from(markdownBody, 'utf-8').toString('base64');

  try {
    if (parsedImage) {
      const imageResponse = await githubCreateFile(
        githubConfig,
        imageGitHubPath,
        parsedImage.base64Payload,
        `Add cover image for "${String(title).trim()}"`
      );

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json().catch(() => ({}));
        return res.status(502).json({
          message: `GitHub rejected the image upload: ${errorData.message || imageResponse.status}`,
        });
      }
    }

    const postResponse = await githubCreateFile(
      githubConfig,
      postGitHubPath,
      markdownBase64,
      `Add post: "${String(title).trim()}"`
    );

    if (!postResponse.ok) {
      const errorData = await postResponse.json().catch(() => ({}));
      return res.status(502).json({
        message: `GitHub rejected the post creation: ${errorData.message || postResponse.status}`,
      });
    }

    return res.status(201).json({
      message: 'Post created successfully.',
      slug: generatedSlug,
      filePath: postGitHubPath,
      imagePath: imageGitHubPath,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not reach GitHub API.' });
  }
}
