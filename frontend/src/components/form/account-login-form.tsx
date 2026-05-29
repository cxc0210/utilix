"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const accountLoginSchema = z.object({
  account: z.string().min(1, {
    message: "请输入账号",
  }),
  password: z.string().min(1, {
    message: "请输入密码",
  }),
});

type AccountLoginValues = z.infer<typeof accountLoginSchema>;

export function AccountLoginForm() {
  const form = useForm<AccountLoginValues>({
    resolver: zodResolver(accountLoginSchema),
    defaultValues: {
      account: "",
      password: "",
    },
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit(() => undefined)}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.account)}>
          <FieldLabel htmlFor="account">账号</FieldLabel>
          <Input
            id="account"
            type="text"
            placeholder="请输入邮箱或用户名"
            className="h-11"
            aria-invalid={Boolean(form.formState.errors.account)}
            {...form.register("account")}
          />
          <FieldError errors={[form.formState.errors.account]} />
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.password)}>
          <FieldLabel htmlFor="password">密码</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="请输入密码"
            className="h-11"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>
      </FieldGroup>
      <Button className="h-11 w-full" size="lg">
        登录
      </Button>
    </form>
  );
}
