"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_DESIGN, type Design, shortName } from "@/lib/design";
import { cn } from "@/lib/utils";
import { useStudio } from "@/stores/studio-store";
import { Field, Group, hintClass, readoutClass } from "./fields";

/** The letter a name suggests for its mark. */
function initialOf(name: string): string {
  const first = [...name.trim()][0];
  return first ? first.toUpperCase() : DEFAULT_DESIGN.text;
}

/** What the site is called and where it lives: the words every preview borrows. */
export function SitePanel() {
  const design = useStudio((state) => state.design);
  const update = useStudio((state) => state.update);
  const tooLong = design.description.length > 160;

  const rename = (name: string) => {
    const patch: Partial<Design> = { name };
    // While the letter still mirrors the name, keep it mirroring.
    if (design.text === initialOf(design.name)) patch.text = initialOf(name);
    update(patch);
  };

  return (
    <>
      <Group>
        <Field
          label="Site name"
          htmlFor="site-name"
          hint={
            design.name.trim().length > 12
              ? `Home screens truncate long labels, so the manifest's short name is “${shortName(design)}”.`
              : "Labels the home-screen icon, the manifest and the card."
          }
        >
          <Input
            id="site-name"
            value={design.name}
            onChange={(event) => rename(event.target.value)}
            placeholder="Acme"
            autoComplete="off"
          />
        </Field>

        <Field
          label="Description"
          htmlFor="site-description"
          aside={
            <span className={cn(readoutClass, tooLong && "text-warn")}>
              {tooLong && "Too long, "}
              {design.description.length}/160
            </span>
          }
          hint="One or two sentences. Search engines cut it off around 160 characters."
        >
          <Textarea
            id="site-description"
            value={design.description}
            onChange={(event) => update({ description: event.target.value })}
            placeholder="What it is, for whom, in a sentence."
          />
        </Field>

        <Field
          label="Domain"
          htmlFor="site-url"
          hint="Social crawlers need an absolute image URL, so the tags are only paste-ready once this is set."
        >
          <Input
            id="site-url"
            type="url"
            inputMode="url"
            value={design.url}
            onChange={(event) => update({ url: event.target.value })}
            placeholder="acme.com"
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
      </Group>

      <Group>
        <p className={hintClass}>
          No keywords, no author, no Twitter handle. Search engines ignore the
          first two and link previews work without the third, so the studio does
          not ask.
        </p>
      </Group>
    </>
  );
}
