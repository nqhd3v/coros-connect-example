"use client";
import { CorosTool } from "@nqhd3v/coros-connect";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/atoms/select";
import { logout, queryCoros } from "./actions";
import { toast } from "@shared/components/atoms/toast";
import { useState } from "react";
import { cn } from "cn";
import { CopyIcon, SpinnerIcon } from "@phosphor-icons/react";

export const FeaturePicker = ({
  tools,
  availables,
}: {
  tools: CorosTool[];
  availables: string[];
}) => {
  const [loading, setLoading] = useState(false);
  const toolsOptions = (tools ?? []).map((t) => ({
    label: t.name,
    value: t.name,
  }));
  const handleToolCalled = async (toolName: string) => {
    setLoading(true);
    try {
      const res = await queryCoros(toolName);
      setLoading(false);
      if (!res?.isSupported) {
        console.log(res?.data);
        return;
      }
      if (!res?.data.parsed) {
        return toast.add({ type: "error", description: "error" });
      }

      toast.add({
        description: (
          <span className="text-xs! block! max-h-100 overflow-y-auto">
            {JSON.stringify(res.data.parsed)}
          </span>
        ),
        actionProps: {
          children: <CopyIcon />,
          onClick: async () =>
            await navigator.clipboard.writeText(
              JSON.stringify(res.data.parsed),
            ),
        },
        timeout: 0,
      });
    } catch (e) {
      console.info("Error when query data", e);
      setLoading(false);
    }
  };

  return (
    <>
      <span className="font-bold block text-gray-600 text-sm mb-1">
        Pick one
      </span>
      <span className="block text-xs italic text-gray-400 mb-1">
        Gray options - not support by library.{" "}
        <code className="rounded-xs bg-gray-100 px-1">F12</code> to see the log.
      </span>
      <div className="flex items-center gap-2 mb-5">
        <Select<string>
          items={toolsOptions}
          onValueChange={(value) => value && handleToolCalled(value)}
        >
          <SelectTrigger className="w-60" disabled={loading}>
            <SelectValue placeholder="Tools" />
          </SelectTrigger>
          <SelectContent className="max-h-100">
            <SelectGroup>
              {toolsOptions.map((item) => (
                <SelectItem
                  key={item.label}
                  value={item.value}
                  className={cn(
                    !availables.includes(item.label) && "italic text-gray-400",
                  )}
                >
                  {item.value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {loading && <SpinnerIcon className="animate-spin" />}
      </div>

      {/* server action, not a GET link: production prefetch would log out */}
      <form action={logout}>
        <button
          type="submit"
          className="text-gray-400 text-xs italic underline cursor-pointer"
        >
          Logout
        </button>
      </form>
    </>
  );
};
