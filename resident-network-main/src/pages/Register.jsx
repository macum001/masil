import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("비밀번호가 서로 다릅니다.");
      return;
    }
    setLoading(true);
    try {
      await authService.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await authService.verifyOtp({ email, otpCode });
      if (result?.access_token) authService.setToken(result.access_token);
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "인증번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await authService.resendOtp(email);
      toast({ title: "인증번호 재전송", description: "테스트 인증번호는 123456 입니다." });
    } catch (err) {
      setError(err.message || "인증번호 재전송에 실패했습니다.");
    }
  };

  const handleGoogle = () => {
    alert("구글 로그인은 정식 출시 단계에서 연결합니다.");
  };

  if (showOtp) {
    return (
      <AuthLayout icon={Mail} title="이메일 인증" subtitle={`인증번호를 보낸 이메일: ${email}`}>
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <p className="mb-4 text-center text-xs text-muted-foreground">MVP 테스트 인증번호는 <strong>123456</strong> 입니다.</p>
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />확인 중...</> : "인증하기"}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          인증번호가 오지 않았나요? <button onClick={handleResend} className="text-primary font-medium hover:underline">재전송</button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="마실 회원가입"
      subtitle="우리 단지 이웃으로 시작하세요"
      footer={<>이미 계정이 있나요? <Link to="/login" className="text-primary font-medium hover:underline">로그인</Link></>}
    >
      <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
        <GoogleIcon className="w-5 h-5 mr-2" />
        Google 가입 준비중
      </Button>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">또는</span></div>
      </div>
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" /><Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required /></div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" /><Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required /></div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">비밀번호 확인</Label>
          <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" /><Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" required /></div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />가입 처리 중...</> : "회원가입"}
        </Button>
      </form>
    </AuthLayout>
  );
}
