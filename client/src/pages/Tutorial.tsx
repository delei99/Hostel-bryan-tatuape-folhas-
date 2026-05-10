import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, Image, Smartphone, Lock, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Tutorial() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            className="text-white hover:bg-blue-500 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-2">Tutorial - Novas Funcionalidades</h1>
          <p className="text-blue-100">Aprenda a usar sincronização online e upload otimizado de fotos</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Seção 1: Sincronização Online */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <Cloud className="text-blue-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Sincronização Online</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">O que é?</h3>
              <p className="text-gray-700 leading-relaxed">
                Agora todos os seus dados de quartos e hóspedes são salvos automaticamente em um banco de dados online. Isso significa que você pode acessar suas informações de qualquer lugar, em qualquer dispositivo (PC, tablet ou celular), e tudo estará sempre sincronizado.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Como funciona?</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Você edita os dados de um hóspede no seu PC</li>
                <li>Os dados são salvos automaticamente no servidor</li>
                <li>Você pega seu celular e acessa o site</li>
                <li>Todas as alterações aparecem instantaneamente no celular</li>
              </ol>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
              <p className="text-blue-900 font-semibold">💡 Dica:</p>
              <p className="text-blue-800">Você não precisa fazer nada especial! A sincronização acontece automaticamente sempre que você faz uma alteração.</p>
            </div>
          </div>
        </section>

        {/* Seção 2: Upload de Fotos */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-green-100 p-4 rounded-lg">
              <Image className="text-green-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Upload de Fotos Otimizado</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">O que mudou?</h3>
              <p className="text-gray-700 leading-relaxed">
                As fotos agora são comprimidas automaticamente antes de serem enviadas. Isso significa que as imagens ocupam muito menos espaço, carregam mais rápido e economizam seus dados móveis. Você não perde qualidade visual, mas ganha em velocidade!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Passo a passo para enviar uma foto:</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-semibold text-gray-800">Clique no ícone de câmera (verde)</p>
                    <p className="text-gray-600 text-sm">Localize a coluna "FOTO" na tabela de hóspedes</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-semibold text-gray-800">Selecione a foto do seu dispositivo</p>
                    <p className="text-gray-600 text-sm">Formatos aceitos: JPG, PNG</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-semibold text-gray-800">Aguarde o envio (alguns segundos)</p>
                    <p className="text-gray-600 text-sm">A foto será comprimida e enviada automaticamente</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-semibold text-gray-800">Pronto! A foto foi salva</p>
                    <p className="text-gray-600 text-sm">Clique no ícone de arquivo para visualizar ou baixar</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-4">
              <p className="text-green-900 font-semibold">📊 Exemplo de compressão:</p>
              <p className="text-green-800">Uma foto de 5 MB pode ser reduzida para ~500 KB, mantendo boa qualidade!</p>
            </div>
          </div>
        </section>

        {/* Seção 3: Upload de Documentos */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-purple-100 p-4 rounded-lg">
              <Lock className="text-purple-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Upload de Documentos</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Enviando documentos (CPF, RG, etc)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Além de fotos, você pode enviar documentos dos hóspedes. O processo é similar ao das fotos:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Clique no ícone de arquivo (azul) na coluna "DOC"</li>
                <li>Selecione o arquivo (PDF, JPG, PNG, DOC, DOCX)</li>
                <li>Aguarde o envio</li>
                <li>O documento será armazenado com segurança no servidor</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-600 p-4">
              <p className="text-purple-900 font-semibold">🔒 Segurança:</p>
              <p className="text-purple-800">Todos os documentos são armazenados de forma segura e só você pode acessá-los após fazer login.</p>
            </div>
          </div>
        </section>

        {/* Seção 4: Acesso Multi-Dispositivo */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-orange-100 p-4 rounded-lg">
              <Smartphone className="text-orange-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Acesso em Múltiplos Dispositivos</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Como acessar de qualquer lugar?</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-mono text-gray-800 break-all">https://hostelmgmt-[seu-codigo].manus.space</p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Basta acessar esse link em qualquer navegador (Chrome, Safari, Firefox, Edge) em qualquer dispositivo. Faça login com suas credenciais e pronto!
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Cenários de uso:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="font-semibold text-orange-900 mb-2">📱 No Celular</p>
                  <p className="text-orange-800 text-sm">Registre hóspedes na recepção em tempo real, tire fotos e envie documentos instantaneamente.</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="font-semibold text-orange-900 mb-2">💻 No PC</p>
                  <p className="text-orange-800 text-sm">Faça relatórios, análises e gerenciamento geral de forma mais confortável.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção 5: Dicas e Truques */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-yellow-100 p-4 rounded-lg">
              <Zap className="text-yellow-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Dicas e Truques</h2>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="font-semibold text-gray-800">✅ Use nomes descritivos para fotos</p>
              <p className="text-gray-600 text-sm">Exemplo: "Hospede_João_CPF.jpg" para facilitar a busca depois</p>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="font-semibold text-gray-800">✅ Tire fotos com boa iluminação</p>
              <p className="text-gray-600 text-sm">Fotos claras comprimem melhor e mantêm qualidade mesmo após redução</p>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="font-semibold text-gray-800">✅ Verifique a conexão de internet</p>
              <p className="text-gray-600 text-sm">Certifique-se de ter uma conexão estável ao fazer uploads de arquivos</p>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="font-semibold text-gray-800">✅ Sincronização automática</p>
              <p className="text-gray-600 text-sm">Você não precisa clicar em "salvar" - tudo é sincronizado automaticamente!</p>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="font-semibold text-gray-800">✅ Acesso offline (em breve)</p>
              <p className="text-gray-600 text-sm">Em futuras atualizações, você poderá editar dados offline e sincronizar depois</p>
            </div>
          </div>
        </section>

        {/* Seção 6: Troubleshooting */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Problemas Comuns</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">❓ A foto não está sendo enviada</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>Verifique sua conexão com a internet</li>
                <li>Tente usar uma foto menor (menos de 10 MB)</li>
                <li>Atualize a página e tente novamente</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">❓ Os dados não estão sincronizando entre dispositivos</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
                <li>Verifique se você está logado em ambos os dispositivos</li>
                <li>Recarregue a página (F5 ou Cmd+R)</li>
                <li>Aguarde alguns segundos para a sincronização completar</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">❓ Esqueci minha senha</h3>
              <p className="text-gray-700">Entre em contato com o administrador do sistema para redefinir sua senha.</p>
            </div>
          </div>
        </section>

        {/* CTA Button */}
        <div className="text-center py-8">
          <Button
            onClick={() => setLocation("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Voltar para o Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}
