import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Plateforme de Défis
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white/10 rounded-lg border border-gray-300">
            <h2 className="text-2xl font-semibold mb-4">Défis Actuels</h2>
            <p className="text-gray-600">
              Participez à nos défis et gagnez des points !
            </p>
          </div>

          <div className="p-6 bg-white/10 rounded-lg border border-gray-300">
            <h2 className="text-2xl font-semibold mb-4">Classement</h2>
            <p className="text-gray-600">
              Consultez le classement des meilleurs participants.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
