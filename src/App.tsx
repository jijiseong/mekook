import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-heading text-5xl font-semibold tracking-tight">
          mekook
        </h1>
        <p className="text-muted-foreground max-w-md">
          시작할 준비가 되었습니다.
        </p>
        <div className="flex gap-2">
          <Button>시작하기</Button>
          <Button variant="outline">더 알아보기</Button>
        </div>
      </div>
    </main>
  )
}

export default App
