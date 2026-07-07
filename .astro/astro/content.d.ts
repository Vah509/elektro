declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"vykonani-roboty": {
"avr-shafa-try-vvody-200a.md": {
	id: "avr-shafa-try-vvody-200a.md";
  slug: "avr-shafa-try-vvody-200a";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"avr-shafa-try-vvody-mlbs.md": {
	id: "avr-shafa-try-vvody-mlbs.md";
  slug: "avr-shafa-try-vvody-mlbs";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"dvyhuny-plavnyi-pusk-4x15kw-ahro.md": {
	id: "dvyhuny-plavnyi-pusk-4x15kw-ahro.md";
  slug: "dvyhuny-plavnyi-pusk-4x15kw-ahro";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"hrshch-160a-dva-vvody-oblik.md": {
	id: "hrshch-160a-dva-vvody-oblik.md";
  slug: "hrshch-160a-dva-vvody-oblik";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"hrshch-400a-skladskyi-kompleks.md": {
	id: "hrshch-400a-skladskyi-kompleks.md";
  slug: "hrshch-400a-skladskyi-kompleks";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"hrshch-400a-vvidnyi-avtomat.md": {
	id: "hrshch-400a-vvidnyi-avtomat.md";
  slug: "hrshch-400a-vvidnyi-avtomat";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"hrshch-avr-160a.md": {
	id: "hrshch-avr-160a.md";
  slug: "hrshch-avr-160a";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"hrshch-avr-200a-skladske.md": {
	id: "hrshch-avr-200a-skladske.md";
  slug: "hrshch-avr-200a-skladske";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"hrshch-avr-250a-3-vvody.md": {
	id: "hrshch-avr-250a-3-vvody.md";
  slug: "hrshch-avr-250a-3-vvody";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"hrshch-avr-250a-kontaktory.md": {
	id: "hrshch-avr-250a-kontaktory.md";
  slug: "hrshch-avr-250a-kontaktory";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"hrshch-avr-400a-technoelectric.md": {
	id: "hrshch-avr-400a-technoelectric.md";
  slug: "hrshch-avr-400a-technoelectric";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"hrshch-rubilnyk-400a-oblik.md": {
	id: "hrshch-rubilnyk-400a-oblik.md";
  slug: "hrshch-rubilnyk-400a-oblik";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"krm-2x40kvar-odyn-korpus.md": {
	id: "krm-2x40kvar-odyn-korpus.md";
  slug: "krm-2x40kvar-odyn-korpus";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"krm-2x95kvar-dvi-ustanovky-ktp.md": {
	id: "krm-2x95kvar-dvi-ustanovky-ktp.md";
  slug: "krm-2x95kvar-dvi-ustanovky-ktp";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"krm-80kvar-5-stupeniv.md": {
	id: "krm-80kvar-5-stupeniv.md";
  slug: "krm-80kvar-5-stupeniv";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shafa-keruvannia-zenitni-lihtari-ovr-pr100.md": {
	id: "shafa-keruvannia-zenitni-lihtari-ovr-pr100.md";
  slug: "shafa-keruvannia-zenitni-lihtari-ovr-pr100";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shafa-shchob-2-kanaly.md": {
	id: "shafa-shchob-2-kanaly.md";
  slug: "shafa-shchob-2-kanaly";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shafi-aeratoriv-agrofirma-weg-ssw07.md": {
	id: "shafi-aeratoriv-agrofirma-weg-ssw07.md";
  slug: "shafi-aeratoriv-agrofirma-weg-ssw07";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shafi-keruvannia-hradirnyi-ventilyatory.md": {
	id: "shafi-keruvannia-hradirnyi-ventilyatory.md";
  slug: "shafi-keruvannia-hradirnyi-ventilyatory";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shafi-keruvannia-indykatsii-nasosni.md": {
	id: "shafi-keruvannia-indykatsii-nasosni.md";
  slug: "shafi-keruvannia-indykatsii-nasosni";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shcho-skladskyi-kompleks-3-zony.md": {
	id: "shcho-skladskyi-kompleks-3-zony.md";
  slug: "shcho-skladskyi-kompleks-3-zony";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shchyt-obohriv-lyvnevok.md": {
	id: "shchyt-obohriv-lyvnevok.md";
  slug: "shchyt-obohriv-lyvnevok";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shchyt-shzo-osvitlennia.md": {
	id: "shchyt-shzo-osvitlennia.md";
  slug: "shchyt-shzo-osvitlennia";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shkaf-indykatsii-apg-mnemo.md": {
	id: "shkaf-indykatsii-apg-mnemo.md";
  slug: "shkaf-indykatsii-apg-mnemo";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shkpp-pidpir-povitria.md": {
	id: "shkpp-pidpir-povitria.md";
  slug: "shkpp-pidpir-povitria";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shksdv-klapan-dyspetcheryzatsiya.md": {
	id: "shksdv-klapan-dyspetcheryzatsiya.md";
  slug: "shksdv-klapan-dyspetcheryzatsiya";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shuz-keruvannia-zasuvkoiu.md": {
	id: "shuz-keruvannia-zasuvkoiu.md";
  slug: "shuz-keruvannia-zasuvkoiu";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"shuz-zasuvka.md": {
	id: "shuz-zasuvka.md";
  slug: "shuz-zasuvka";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
"vrshch-200a-magazyn-kavyarnia.md": {
	id: "vrshch-200a-magazyn-kavyarnia.md";
  slug: "vrshch-200a-magazyn-kavyarnia";
  body: string;
  collection: "vykonani-roboty";
  data: InferEntrySchema<"vykonani-roboty">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
