import { defineField, defineType } from "sanity";

export const emailTemplateType = defineType({
  name: "emailTemplate",
  title: "Email template",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Internal label (e.g. “Spring course sale”).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Offer / promotion", value: "offer" },
          { title: "Announcement", value: "announcement" },
          { title: "Newsletter", value: "newsletter" },
          { title: "Other", value: "other" },
        ],
        layout: "radio",
      },
      initialValue: "offer",
    }),
    defineField({
      name: "subject",
      title: "Subject line",
      type: "string",
      description: "Supports placeholders: {{firstName}}, {{lastName}}, {{siteUrl}}, {{dashboardUrl}}",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "htmlBody",
      title: "HTML body",
      type: "text",
      rows: 18,
      description:
        "Full HTML for the email body (not the outer html/head tags—just content you want inside a wrapper). Same placeholders as subject. We send multipart: HTML + plain text.",
    }),
    defineField({
      name: "plainTextBody",
      title: "Plain text body (optional)",
      type: "text",
      rows: 8,
      description:
        "Optional. If empty, plain text is auto-generated from HTML for inboxes that prefer text.",
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Inactive templates are hidden from the admin campaign picker.",
    }),
  ],
  preview: {
    select: { title: "name", category: "category", subject: "subject" },
    prepare({ title, category, subject }) {
      return {
        title: title || "Template",
        subtitle: `${category || "—"} — ${subject || ""}`,
      };
    },
  },
});
