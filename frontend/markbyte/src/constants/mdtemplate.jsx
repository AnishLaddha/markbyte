const mdtemplates = [
  // Template 1: Header Only
  `# Blog Post Title  

![Featured Image Description](/path/to/image.jpg)`,

  // Template 2: Body Only
  `## Introduction

Briefly introduce your topic.

## Main Content

Use headings and subheadings to organize ideas.

## Conclusion

Summarize your post and invite readers to engage.

`,

  // Template 3: Footer Only
  `---

### About the Author

Include a brief bio here—2-3 sentences about yourself and your expertise.

### References

- [Link Title 1](https://example.com)
- [Link Title 2](https://example.com)

> **Note to editors:** Add any notes for the editorial team here. This section will be removed before publishing.`,

  // Template 4: Complete Template (Header + Body + Footer)
  `# Blog Post Title  

![Featured Image Description](/path/to/image.jpg)

## Introduction

Write a brief introduction to your blog post here. This should grab the reader's attention and provide a preview of what they'll learn or discover.

## Main Content

This is where the bulk of your content goes. Feel free to use multiple sections with appropriate headings.

### Section 1

Discuss the key points of this section in clear and concise paragraphs.

- Use bullet points to highlight important information
- Provide key insights or takeaways
- Keep the content engaging and informative

### Section 2

Continue developing your ideas with structured paragraphs and relevant examples.

\`\`\`javascript
// Include code snippets if relevant
function example() {
  return "This is how you can include code in your post";
}
\`\`\`

## Real-World Example

If applicable, provide a real-world example or case study that illustrates your main points.

## Key Takeaways

Summarize the main points of your post:

1. First key point
2. Second key point
3. Third key point

## Conclusion

Wrap up your blog post with a conclusion that reinforces your main message. You may include a call to action or questions for readers to consider.

---

### About the Author

Include a brief bio here—2-3 sentences about yourself and your expertise.

### References

- [Link Title 1](https://example.com)
- [Link Title 2](https://example.com)

> **Note to editors:** Add any notes for the editorial team here. This section will be removed before publishing.`,
];

export default mdtemplates;
