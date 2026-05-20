import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { type FormEvent } from 'react';
import { login as loginRoute } from '@/routes';
import { useGoogleLogin } from '@react-oauth/google';
import { Head, useForm } from '@inertiajs/react';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const { role } = props

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
    role: role
  });

  function submit(e: FormEvent) {
      e.preventDefault();
      post(loginRoute.url());
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={submit}>
      <Head title="Log in" />
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            required
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email}</p>
          ) : null}
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password}</p>
          ) : null}
        </Field>
        <Field>
          <Button type="submit"
              disabled={processing}
              size="lg"
            >{processing ? 'Logining in…' : 'Login in'}</Button>
          <Button variant="outline" type="button">
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account? <a href="#">Sign up</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
