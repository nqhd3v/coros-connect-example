"use client";
import { Button } from "@shared/components/molecules/button";
import { toast } from "@shared/components/atoms/toast";
import { getCorosAuthURL } from "./actions";
import { useState } from "react";

const LoginCoros = () => {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    try {
      setLoading(true);
      const url = await getCorosAuthURL();
      if (!url) {
        toast.add({
          description: "looks like u already logged-in before! try to reload",
        });
        return;
      }
      globalThis.location.href = url;
    } catch (err) {
      console.error("Error when authenticating:", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button onClick={handleLogin} loading={loading}>
      Login with COROS
    </Button>
  );
};

export default LoginCoros;
