# Mobile app (`@expense-tracker/mobile`)

Expo SDK 57, React Native 0.86, Expo Router, TypeScript (strict), NativeWind 4.2 with Tailwind CSS 3.4, Firebase.

Setup, prerequisites and run commands are in the [root README](../../README.md). This document describes how the code is organised.

## Folder structure

```text
apps/mobile/
├── app.json                 Expo config
├── babel.config.js          babel-preset-expo + NativeWind JSX transform
├── metro.config.js          Expo Metro config wrapped with NativeWind
├── tailwind.config.js       Tailwind content paths, NativeWind preset, theme colors
├── global.css               Tailwind directives, imported once in src/app/_layout.tsx
├── nativewind-env.d.ts      className types for React Native components
├── assets/                  Images and icons
└── src/
    ├── app/                 Expo Router routes and layouts only
    ├── features/            Feature code: screens, components, hooks, api, schemas, types
    │   ├── auth/
    │   ├── profile/
    │   ├── statistics/
    │   ├── transactions/
    │   └── wallets/
    ├── components/
    │   ├── ui/              Shared UI building blocks (Button, Input, Typo, ...)
    │   └── navigation/      App-shell navigation UI (custom tab bar)
    ├── lib/                 Shared infrastructure (Firebase, cn(), NativeWind interop, shared types)
    └── theme/               Design tokens (colors)
```

## Conventions

### Routes (`src/app`)

- Files in `src/app` define URLs and navigation only. A route file re-exports a screen from its feature:

  ```tsx
  export { default } from "@/features/auth/screens/LoginScreen";
  ```

- Layouts (`_layout.tsx`), route groups such as `(auth)` and `(tabs)`, and the protected-route setup stay in `src/app`.
- Do not put non-route modules in `src/app`; Expo Router treats every file there as a route.
- The Home, Wallet and Statistics tabs are still placeholders defined directly in their route files. When a feature is built, move its screen to `src/features/<feature>/screens/` and make the route file re-export it.

### Features (`src/features/<feature>`)

Create only the subfolders a feature actually needs:

| Folder / file | Contents                                                                      |
| ------------- | ----------------------------------------------------------------------------- |
| `screens/`    | Screen components rendered by routes (`LoginScreen.tsx`)                      |
| `components/` | Components used only by this feature                                          |
| `hooks/`      | Hooks used only by this feature (`useWallets.ts`)                             |
| `api/`        | Functions that talk to Firebase or, later, the Express API                    |
| `schemas/`    | Validation schemas for forms and API payloads                                 |
| `context/`    | React context providers owned by the feature (`auth/context/authContext.tsx`) |
| `types.ts`    | Types owned by the feature                                                    |

- Code used by two or more features moves to `src/components/ui`, `src/lib` or `src/theme`.
- A feature may import another feature's `api/` functions or `types.ts` (for example, auth saves the profile through `profile/api/userService.ts`). Avoid importing another feature's screens or internal components, and avoid circular imports.

### Shared code

- `src/components/ui`: presentational building blocks with no feature knowledge. Their prop types live in `src/components/ui/types.ts`.
- `src/components/navigation`: navigation chrome such as the custom tab bar.
- `src/lib`: infrastructure shared by all features: `firebase.ts` (app, auth, firestore, storage), `cn.ts` (class merging), `nativewind.ts` (className support for third-party components) and shared types such as `ResponseType`. A future API client belongs here.
- `src/theme`: design tokens (see below).

### Imports and naming

- `@/` maps to `src/` (configured in `tsconfig.json`; Metro reads the same alias). Use `@/` for anything outside the current folder and `./` only for files in the same folder.
- Components and screens use PascalCase file names (`ProfileScreen.tsx`). Other modules use camelCase (`authService.ts`). Hooks start with `use`.
- Static assets are imported with a relative `require`, for example `require("../../../../assets/images/welcome.png")` from `src/features/auth/screens`.

## Styling with NativeWind

All styling uses NativeWind `className`. Do not add `StyleSheet.create` or inline `style` objects.

```tsx
<View className="flex-1 items-center gap-5 bg-neutral-900 px-5">
  <Typo className="text-[30px] font-extrabold">Welcome back</Typo>
</View>
```

- **Sizes are fixed (dp)** and do not scale with the screen. With `inlineRem: 16` in `metro.config.js`, Tailwind's scale works as in its documentation: `p-4` is 16px, `gap-5` is 20px, `h-11` is 44px.
- **Prefer the Tailwind scale** (`p-5`, `gap-2.5`, `rounded-xl`, `rounded-full`). Use an arbitrary value (`h-[52px]`, `rounded-[17px]`) only when the design needs a size the scale does not have.
- **Font sizes use arbitrary values** such as `text-[16px]`. Tailwind's named sizes (`text-base`, `text-lg`, ...) also set a line height, which changes text layout compared with React Native's default.
- **Platform differences** use variants: `pt-[50px] ios:pt-[6vh]`, `h-[55px] ios:h-[73px]`.
- **Shadows** use arbitrary `shadow-[x_y_blur_color]`. NativeWind derives Android `elevation` from the blur, so when iOS and Android need different values write both: `android:shadow-[0px_0px_4px_#000000] ios:shadow-[0px_0px_10px_rgba(0,0,0,0.25)]`.
- **Dynamic classes must be complete strings.** Tailwind only generates classes it can find in the source, so write `isActive ? "opacity-50" : "opacity-100"`, never `` `opacity-${value}` ``. Data that selects a style stores a full class name (for example `bgClassName: "bg-indigo-500"` in the profile options).
- **Values that are props, not styles,** stay props and come from the tokens: icon `size`/`color`, `placeholderTextColor`, `ActivityIndicator` `color`. Example: `<Icons.UserIcon size={26} color={colors.white} />`.

### Components that accept `className`

- Shared components take a `className` prop and merge it with their own classes using `cn()` from `@/lib/cn`:

  ```tsx
  <Text className={cn("text-[18px] text-white", className)} {...props} />
  ```

  `cn` (`clsx` + `tailwind-merge`) lets the caller override defaults: `cn("text-[18px] text-white", "text-[30px]")` gives `text-white text-[30px]`. Without it, two conflicting classes are resolved by stylesheet order, not by their order in the string. Use `cn` for conditional classes too: `cn("py-2.5", isBusy && "opacity-50")`.

- `Typo` is the text component. Its defaults are `text-[18px] text-white`; pass size, weight and color as classes: `<Typo className="text-[15px] font-bold text-primary">`.
- `Input` takes `containerClassName` for the outer row and `className` for the text field. `ScrollView` uses `contentContainerClassName`.
- React Native core components (`View`, `Text`, `Pressable`, `TouchableOpacity`, `TextInput`, `ScrollView`, `Image`, ...) support `className` out of the box. Third-party components need one `cssInterop` registration in `src/lib/nativewind.ts`, which is imported once in `src/app/_layout.tsx`. It currently registers `expo-image`'s `Image`, Reanimated's `Animated.View` and `Animated.Image`, and Expo Router's `PlatformPressable`.

### Tooling

- After changing `tailwind.config.js`, `global.css`, `babel.config.js` or `metro.config.js`, restart Metro with `npx expo start --clear`.
- Prettier sorts Tailwind classes automatically, including inside `cn(...)`.

## Design tokens

`src/theme/colors.ts` is the single source of truth for colors. It has no imports, so both TypeScript code and `tailwind.config.js` can read it. In components, use the Tailwind classes; use `colors` from `@/theme` only for props that are not styles (icon colors, `placeholderTextColor`).

| Token in `colors`                        | As a prop value     | Tailwind class examples                                                       |
| ---------------------------------------- | ------------------- | ----------------------------------------------------------------------------- |
| `primary`, `primaryLight`, `primaryDark` | `colors.primary`    | `bg-primary`, `text-primary-light`, `border-primary-dark`                     |
| `text`, `textLight`, `textLighter`       | `colors.textLight`  | `text-foreground`, `text-foreground-light`, `text-foreground-lighter`         |
| `rose`, `green`                          | `colors.rose`       | `text-rose`, `bg-green` (Tailwind's `rose-500`, `green-600`, ... still exist) |
| `neutral50` … `neutral900`, `neutral350` | `colors.neutral800` | `bg-neutral-800`, `border-neutral-350`                                        |
| `white`, `black`                         | `colors.white`      | `text-white`, `bg-black`                                                      |

Import colors with `import { colors } from "@/theme";`. Spacing, sizes and radii come from the Tailwind scale; there are no separate spacing tokens.

To add or change a shared token:

1. Add or change the value in `src/theme/colors.ts`.
2. If it should be usable from `className`, map it in `theme.extend.colors` in `tailwind.config.js`.
3. Restart Metro with `npx expo start --clear`.

Keep feature-specific one-off values inside the feature. Only values shared across features belong in `src/theme`.

## Quality checks

```powershell
npm run typecheck
npm run lint
npm run format:check
```

These scripts can be run from `apps/mobile` or, for all workspaces, from the repository root.
