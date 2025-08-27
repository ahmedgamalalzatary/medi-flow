# Mediflow - Next.js + Redux Toolkit + Tailwind CSS

A complete Next.js application setup with Redux Toolkit ecosystem and Tailwind CSS for modern state management and styling.

## 🚀 Features

- **Next.js 15** with App Router and TypeScript
- **Redux Toolkit (RTK)** for state management
- **RTK Query** for efficient data fetching and caching
- **Tailwind CSS** for utility-first styling
- **Turbopack** for fast development builds
- **Dark mode** support out of the box
- **TypeScript** for type safety
- **ESLint** for code quality

## 📦 Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) - Data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [React Redux](https://react-redux.js.org/) - React bindings for Redux

## 🏗️ Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout with Redux Provider
│   └── page.tsx             # Home page with demo components
├── components/
│   ├── Counter.tsx          # Redux counter demo
│   └── PostsList.tsx       # RTK Query demo
└── lib/
    ├── features/
    │   ├── api/
    │   │   └── apiSlice.ts   # RTK Query API slice
    │   └── counter/
    │       └── counterSlice.ts # Counter state slice
    ├── hooks.ts             # Typed Redux hooks
    ├── store.ts             # Redux store configuration
    └── StoreProvider.tsx    # Redux Provider wrapper
```

## 🛠️ Installation

1. **Clone or use this setup:**
   ```bash
   # If cloning, cd into the directory
   cd mediflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 What's Included

### Redux Toolkit Setup

- **Store Configuration**: Properly configured Redux store with RTK Query middleware
- **Typed Hooks**: Custom hooks with TypeScript support (`useAppDispatch`, `useAppSelector`)
- **Provider Wrapper**: Client-side Redux Provider for Next.js App Router

### RTK Query Demo

- **API Slice**: Configured with JSONPlaceholder API for testing
- **CRUD Operations**: GET, POST operations with caching
- **Error Handling**: Proper error states and loading indicators
- **TypeScript Integration**: Fully typed API responses

### Components

1. **Counter Component**: Demonstrates basic Redux state management
   - Increment/Decrement actions
   - Custom increment amounts
   - Reset functionality

2. **Posts List Component**: Showcases RTK Query data fetching
   - Fetches and displays posts and users
   - Create new posts functionality
   - Loading and error states
   - Responsive design with Tailwind

### Tailwind CSS Configuration

- **Custom Configuration**: Tailwind config with content paths
- **Dark Mode**: Automatic dark mode support
- **Custom Variables**: CSS custom properties integration
- **Responsive Design**: Mobile-first approach

## 🧩 Usage Examples

### Using Redux State

```tsx
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { increment, decrement } from '@/lib/features/counter/counterSlice'

function MyComponent() {
  const count = useAppSelector((state) => state.counter.value)
  const dispatch = useAppDispatch()

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  )
}
```

### Using RTK Query

```tsx
import { useGetPostsQuery, useCreatePostMutation } from '@/lib/features/api/apiSlice'

function PostsComponent() {
  const { data: posts, isLoading, error } = useGetPostsQuery()
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error occurred</div>

  return (
    <div>
      {posts?.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  )
}
```

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for environment variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-url.com
```

### Customizing the Store

Add new slices to `src/lib/store.ts`:

```tsx
import yourSliceReducer from './features/yourSlice/yourSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    yourSlice: yourSliceReducer, // Add your slice here
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // ...
})
```

## 🎨 Styling

The project uses Tailwind CSS with:

- Custom color variables that work with dark mode
- Responsive design patterns
- Component-based styling approach
- Utility-first CSS methodology

## 🚀 Deployment

This project can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Any platform supporting Node.js**

For Vercel deployment:

```bash
npm run build
# Deploy using Vercel CLI or connect your repository
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
