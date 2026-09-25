export interface ParsedFieldError {
  field?: string;
  message: string;
}

/**
 * Parses Zod issues, API error responses, JSON error strings, and Error instances
 * into a strongly-typed list of field-level errors for forms and modals.
 */
export function parseModalError(error: unknown): ParsedFieldError[] {
  if (!error) return [];

  let target: any = error;

  // 1. Handle JSON stringified error payloads
  if (typeof target === 'string') {
    const trimmed = target.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        target = JSON.parse(trimmed);
      } catch {
        return [{ message: target }];
      }
    } else {
      return [{ message: target }];
    }
  }

  const extractIssue = (item: any): ParsedFieldError | null => {
    if (!item) return null;
    if (typeof item === 'string') return { message: item };

    const message = item.message || item.error || null;
    if (!message) return null;

    let field: string | undefined;
    if (Array.isArray(item.path) && item.path.length > 0) {
      field = item.path.join('.');
    } else if (typeof item.field === 'string') {
      field = item.field;
    } else if (typeof item.property === 'string') {
      field = item.property;
    }

    return { field, message };
  };

  // 2. Process objects and arrays
  if (typeof target === 'object' && target !== null) {
    if (target.response?.data) {
      return parseModalError(target.response.data);
    }

    if (Array.isArray(target)) {
      return target
        .map(extractIssue)
        .filter((item: ParsedFieldError | null): item is ParsedFieldError => item !== null);
    }

    if (Array.isArray(target.issues)) {
      return target.issues
        .map(extractIssue)
        .filter((item: ParsedFieldError | null): item is ParsedFieldError => item !== null);
    }

    if (Array.isArray(target.errors)) {
      return target.errors
        .map(extractIssue)
        .filter((item: ParsedFieldError | null): item is ParsedFieldError => item !== null);
    }

    if (typeof target.message === 'string') {
      const msgTrimmed = target.message.trim();
      if (
        (msgTrimmed.startsWith('[') && msgTrimmed.endsWith(']')) ||
        (msgTrimmed.startsWith('{') && msgTrimmed.endsWith('}'))
      ) {
        try {
          return parseModalError(JSON.parse(msgTrimmed));
        } catch {
          // Fall through
        }
      }
      const issue = extractIssue(target);
      return issue ? [issue] : [{ message: target.message }];
    }

    if (typeof target.error === 'string') {
      return [{ message: target.error }];
    }
  }

  return [{ message: 'An unexpected error occurred. Please try again.' }];
}
