import { useRouter } from "next/navigation";

export function useNavigate() {
  const router = useRouter();
  
  return (options: { to: string; search?: Record<string, any>; replace?: boolean }) => {
    let url = options.to;
    
    if (options.search) {
      const searchParams = new URLSearchParams();
      Object.entries(options.search).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }
    
    if (options.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };
}
