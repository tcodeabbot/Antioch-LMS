import Image from "next/image";
import { defineField, defineType } from "sanity";

export const studentType = defineType({
  name: "student",
  title: "Student",
  type: "document",
  fields: [
    defineField({
      name: "firstName",
      title: "First Name",
      type: "string"
    }),
    defineField({
      name: "lastName",
      title: "Last Name",
      type: "string"
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "clerkId",
      title: "Clerk User ID",
      type: "string",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "imageUrl",
      title: "Profile Image URL",
      type: "url"
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string"
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "object",
      fields: [
        {
          name: "street",
          title: "Street Address",
          type: "string"
        },
        {
          name: "city",
          title: "City",
          type: "string"
        },
        {
          name: "state",
          title: "State/Province",
          type: "string"
        },
        {
          name: "postalCode",
          title: "Postal Code",
          type: "string"
        },
        {
          name: "country",
          title: "Country",
          type: "string"
        }
      ]
    }),
    defineField({
      name: "onboardingCompleted",
      title: "Onboarding Completed",
      type: "boolean",
      initialValue: false
    })
  ],
  preview: {
    select: {
      firstName: "firstName",
      lastName: "lastName",
      imageUrl: "imageUrl"
    },
    prepare({ firstName, lastName, imageUrl }) {
      return {
        title: `${firstName.charAt(0).toUpperCase()}${firstName.slice(
          1
        )} ${lastName.charAt(0).toUpperCase()}${lastName.slice(1)}`,
        media: (
          <Image
            src={imageUrl}
            alt={`${firstName} ${lastName}`}
            width={100}
            height={100}
          />
        )
      };
    }
  }
});
