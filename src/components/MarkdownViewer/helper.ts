const returnJsonMarkdown = (json: string) => {
  return `\`\`\`json
  ${json}
\`\`\``;
};

const getMarkdown = (source: string, type: "json" | "markdown") => {
  if (type === "json") {
    return returnJsonMarkdown(source);
  }

  return source;
};

export { returnJsonMarkdown, getMarkdown };
