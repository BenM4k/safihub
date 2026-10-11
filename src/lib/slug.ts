/**
 * Utility functions for generating clean, unique, URL-safe slugs.
 */

/**
 * Converts a string (such as a house name) into a URL-friendly kebab-case slug.
 * Removes French accents, replaces spaces and underscores with hyphens,
 * and strips non-alphanumeric characters.
 */
export function slugify(input: string): string {
  if (!input) return "";

  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-_]/g, "") // Remove special characters
    .replace(/[\s_]+/g, "-") // Convert spaces and underscores to hyphens
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
}

/**
 * Generates a unique slug by appending a suffix (-2, -3, etc.) if a collision is found.
 *
 * @param name - The base name to slugify
 * @param isSlugTaken - Either a set/array of taken slugs, or an async callback checking uniqueness
 */
export async function generateUniqueSlug(
  name: string,
  isSlugTaken:
    | string[]
    | Set<string>
    | ((slug: string) => boolean | Promise<boolean>)
): Promise<string> {
  const baseSlug = slugify(name) || "house";
  let candidate = baseSlug;
  let counter = 1;

  const checkFn =
    typeof isSlugTaken === "function"
      ? isSlugTaken
      : (s: string) =>
          isSlugTaken instanceof Set
            ? isSlugTaken.has(s)
            : isSlugTaken.includes(s);

  while (await checkFn(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}
