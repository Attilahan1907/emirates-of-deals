import os
import json
import redis
import time
from typing import Any, Optional

CACHE_TTL = 600  # 10 minutes

class RedisCache:
    def __init__(self):
        self.redis_url = os.environ.get('REDIS_URL', '')
        self.client: Optional[redis.Redis] = None
        self._use_memory_fallback = False
        
        if self.redis_url:
            try:
                self.client = redis.from_url(self.redis_url, decode_responses=True)
                self.client.ping()
                print(f"[cache] Redis connected: {self.redis_url[:20]}...")
            except Exception as e:
                print(f"[cache] Redis connection failed: {e}, using in-memory fallback")
                self._use_memory_fallback = True
                self._memory_cache = {}
                self._memory_cache_ts = {}
        else:
            print("[cache] No REDIS_URL set, using in-memory fallback")
            self._use_memory_fallback = True
            self._memory_cache = {}
            self._memory_cache_ts = {}

    def get(self, key: str) -> Optional[Any]:
        if self._use_memory_fallback:
            if key in self._memory_cache:
                data, ts = self._memory_cache[key], self._memory_cache_ts[key]
                if time.time() - ts < CACHE_TTL:
                    return data
                del self._memory_cache[key]
                del self._memory_cache_ts[key]
            return None
            
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            print(f"[cache] Redis get error: {e}")
        return None

    def set(self, key: str, data: Any) -> None:
        if self._use_memory_fallback:
            self._memory_cache[key] = data
            self._memory_cache_ts[key] = time.time()
            return
            
        try:
            self.client.setex(key, CACHE_TTL, json.dumps(data))
        except Exception as e:
            print(f"[cache] Redis set error: {e}")

    def delete(self, key: str) -> None:
        if self._use_memory_fallback:
            self._memory_cache.pop(key, None)
            self._memory_cache_ts.pop(key, None)
            return
            
        try:
            self.client.delete(key)
        except Exception as e:
            print(f"[cache] Redis delete error: {e}")

# Global cache instance
cache = RedisCache()
