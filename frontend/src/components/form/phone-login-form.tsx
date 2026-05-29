"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const phoneLoginSchema = z.object({
  phone: z
    .string()
    .min(1, {
      message: "请输入手机号",
    })
    .regex(/^1[3-9]\d{9}$/, {
      message: "手机号格式不正确",
    }),
  code: z
    .string()
    .min(1, {
      message: "是输入验证码",
    })
    .regex(/^\d{6}$/, {
      message: "请输入6位验证码",
    }),
});

type PhoneLoginValues = z.infer<typeof phoneLoginSchema>;

export function PhoneLoginForm() {
  const [countdown, setCountdown] = useState(0);
  const [sendCodeError, setSendCodeError] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const form = useForm<PhoneLoginValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: "",
      code: "",
    },
  });

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  async function handleSendCode() {
    const isPhoneValid = await form.trigger("phone");

    if (!isPhoneValid) {
      return;
    }

    setIsSendingCode(true);
    setSendCodeError("");

    try {
      const response = await fetch("/api/auth/verification-code/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: `+86${form.getValues("phone").trim()}`,
        }),
      });
      const result = (await response.json()) as {
        code: number;
        data?: {
          expiresInSeconds?: number;
        };
        message?: string;
      };

      if (!response.ok || result.code < 200 || result.code >= 300) {
        setSendCodeError(result.message || "验证码发送失败，请稍后重试");
        return;
      }

      setCountdown(result.data?.expiresInSeconds ?? 60);
    } catch {
      setSendCodeError("验证码发送失败，请稍后重试");
    } finally {
      setIsSendingCode(false);
    }
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit(() => undefined)}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="phone">手机号</FieldLabel>
          <div className="flex h-11 overflow-hidden rounded-lg border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
            <div className="flex items-center border-r border-input bg-muted/50 px-3 text-sm text-muted-foreground">
              +86
            </div>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="请输入手机号"
              className="h-full rounded-none border-0 bg-transparent focus-visible:ring-0"
              {...form.register("phone")}
            />
          </div>
          <FieldError errors={[form.formState.errors.phone]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone-code">验证码</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="phone-code"
              type="text"
              inputMode="numeric"
              placeholder="请输入验证码"
              className="h-11"
              {...form.register("code")}
            />
            <Button
              type="button"
              variant="outline"
              className="h-11 w-28 shrink-0"
              disabled={isSendingCode || countdown > 0}
              onClick={handleSendCode}
            >
              {countdown > 0
                ? `${countdown}s`
                : isSendingCode
                  ? "发送中"
                  : "获取验证码"}
            </Button>
          </div>
          <FieldError errors={[form.formState.errors.code]} />
          {sendCodeError ? <FieldError>{sendCodeError}</FieldError> : null}
        </Field>
      </FieldGroup>
      <Button type="submit" className="h-11 w-full" size="lg">
        登录 / 注册
      </Button>
      <FieldDescription className="text-center text-xs">
        未注册的手机号将自动创建账号
      </FieldDescription>
    </form>
  );
}
