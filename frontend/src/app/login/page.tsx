import Image from "next/image";
import Link from "next/link";
import { AccountLoginForm } from "@/components/form/account-login-form";
import { PhoneLoginForm } from "@/components/form/phone-login-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 font-sans dark:bg-slate-950">
      <Card className="w-full max-w-[420px] border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <CardHeader className="items-center gap-4 px-8 pt-8 text-center">
          <Link
            href="/"
            aria-label="返回首页"
            className="flex w-full justify-center"
          >
            <Image
              src="/images/utilix-icon.png"
              alt="Utilix logo"
              width={72}
              height={72}
              priority
            />
          </Link>
          <div className="grid gap-2">
            <CardTitle className="text-2xl font-semibold">欢迎使用 Utilix</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="phone" className="gap-6">
            <TabsList className="grid h-10 w-full grid-cols-2">
              <TabsTrigger value="phone">手机号登录</TabsTrigger>
              <TabsTrigger value="account">账号登录</TabsTrigger>
            </TabsList>
            <TabsContent value="phone">
              <PhoneLoginForm />
            </TabsContent>
            <TabsContent value="account">
              <AccountLoginForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
