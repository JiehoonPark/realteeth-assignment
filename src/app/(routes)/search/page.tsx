"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

const NOT_FOUND_MESSAGE = "해당 장소의 정보가 제공되지 않습니다.";
const BACK_LABEL = "뒤로가기";
const CONTENT_MIN_HEIGHT_CLASS = "min-h-[180px]";

export default function SearchPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center px-6 pb-8">
      <Card className="w-full">
        <CardContent
          className={`flex ${CONTENT_MIN_HEIGHT_CLASS} flex-col items-center justify-center gap-4 text-center`}
        >
          <p className="text-sm text-muted-foreground">{NOT_FOUND_MESSAGE}</p>
          <Button type="button" variant="outline" onClick={handleBack}>
            {BACK_LABEL}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
