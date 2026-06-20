const STORAGE_KEY = 'recrie-agencia-data'

export interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export interface Prompt {
  id: string
  category_id: string | null
  title: string
  content: string
  tags: string[] | null
  is_favorite: boolean
  created_at: string
}

export interface Reference {
  id: string
  category_id: string | null
  title: string
  description: string | null
  image_url: string
  thumbnail_url: string
  tags: string[] | null
  is_favorite: boolean
  created_at: string
}

interface AgenciaData {
  categories: Category[]
  prompts: Prompt[]
  references: Reference[]
}

const uid = () => Math.random().toString(36).slice(2, 11)

function createSeedData(): AgenciaData {
  return {
    categories: [
      { id: '0f05c079-8170-489c-a800-9b54b3ad9795', name: 'ESTILO DE ANIMAÇÕES', color: '#ec4899', icon: 'folder' },
      { id: '71556972-14a8-47ec-b0c0-6919623cd31e', name: 'UP SCALE', color: '#3b82f6', icon: 'folder' },
      { id: 'ff4aa6f6-97d4-4bf6-a4d3-7b930693b4d6', name: 'VARIAÇÃO STORY TELLING', color: '#14b8a6', icon: 'folder' },
    ],
    prompts: [
      { id: '2cf264c0', category_id: null, title: 'ILUMINAÇÃO C4', content: `RECRIE ESSA IMAGEM APLICANDO REALISMO FOTOGRÁFICO MANTENDO TRAVA ABSOLUTA DE IDENTIDADE
 **fundo escuro profundo com atmosfera cinematográfica, criando sensação de ambiente dark elegante e realista.**
**iluminação amarela neon na tonalidade quente, posicionada em backlight e rim light suave, formando um contorno luminoso sutil ao redor da silhueta do indivíduo, simulando luz prática real de estúdio.**
**A luz deve gerar reflexos realistas na pele, roupa e elementos metálicos, com gradiente natural e difusão suave, evitando efeito artificial ou exagerado.**
**CRIAR profundidade cinematográfica com contraste controlado**, sombras ricas e iluminação lateral estilo documentário premium.
Adicionar leve **bloom neon controlado**, volumetric light discreto e integração ambiental para sensação de realismo físico.
Aplicar **texturas ultra realistas**, evidenciando poros da pele com micro detalhes,e highlights especulares realistas.
Estética de câmera profissional: **lente cine prime f/1.8**, leve aberração cromática cinematográfica, profundidade de campo natural e nitidez seletiva no sujeito.
Resultado final com **qualidade ultra realista, padrão publicidade premium, iluminação de estúdio integrada ao ambiente**, sem modificar a essência original da imagem.`, tags: null, is_favorite: false, created_at: '2026-05-26T01:23:35Z' },
      { id: '32af3a66', category_id: null, title: 'ILUMINAÇÃO ZENITH', content: `RECRIE ESSA IMAGEM APLICANDO REALISMO FOTOGRÁFICO MANTENDO TRAVA ABSOLUTA DE IDENTIDADE
 **fundo escuro profundo com atmosfera cinematográfica, criando sensação de ambiente dark elegante e realista.**
**iluminação branca neon na tonalidade fria, posicionada em backlight e rim light suave, formando um contorno luminoso sutil ao redor da silhueta do indivíduo, simulando luz prática real de estúdio.**
**A luz deve gerar reflexos realistas na pele, roupa e elementos metálicos, com gradiente natural e difusão suave, evitando efeito artificial ou exagerado.**
**CRIAR profundidade cinematográfica com contraste controlado**, sombras ricas e iluminação lateral estilo documentário premium.
Adicionar leve **bloom neon controlado**, volumetric light discreto e integração ambiental para sensação de realismo físico.
Aplicar **texturas ultra realistas**, evidenciando poros da pele com micro detalhes,e highlights especulares realistas.
Estética de câmera profissional: **lente cine prime f/1.8**, leve aberração cromática cinematográfica, profundidade de campo natural e nitidez seletiva no sujeito.
Resultado final com **qualidade ultra realista, padrão publicidade premium, iluminação de estúdio integrada ao ambiente**, sem modificar a essência original da imagem.`, tags: null, is_favorite: false, created_at: '2026-05-26T01:24:12Z' },
      { id: '3a072108', category_id: null, title: 'SUNO', content: 'Reescreva a musica a cima mantendo a fonetica, a cadência e a estrutura', tags: null, is_favorite: false, created_at: '2026-02-16T01:35:53Z' },
      { id: '42d6887c', category_id: null, title: 'CYBER PUNK', content: `Transforme-se em um retrato no estilo cyberpunk com luzes de néon e elementos futuristas "
as luzes neon devem ter a cor dourada, a pessoa da foto se transforma em um ciborg humanoide, a imagem deve ser ultra realista render 8k.
mantenha perfeitamente as caracteristicas do porte fisico com fidelidade e textura ultra realista na pele e tecido da roupa com a mesma pose da foto
Com composições mais profissionais como de um diretor de fotografia: Regra dos terços, proporção áurea, bem como os filmes premiados.
Mantenha o mesmo individuo com 100% de fidelidade.
A luz é realista, ,como em um filme.
Quero texturas no personagem, detalhes na pele, leves imperfeições, textura na roupa e brilhos realistas.
Lente 35mm f1.8 com aberração cromática`, tags: null, is_favorite: false, created_at: '2026-01-27T02:38:27Z' },
      { id: '56f72a94', category_id: null, title: 'COMANDO VEO3', content: 'CHAT A PARTIR DE AGORA VOÇÊ É UM PRODUTOR CINEMATÓGRÁFICO, FAREMOS UM PROJETO DE VIDEO COM IA USANDO O VEO3. EU IREI ENVIAR IMAGENS E EM SEGUIDA VOCÊ ANALISA E CRIA UM COMANDO APRIMORADO COM A MELHOR LINGUAGEM DE COMANDO PARA VEO3. ESCOLHA A MELHOR CÂMERA E LENTE PARA GRAVAÇÕES CINEMATOGRÁFICAS. CRIE UM COMANDO EM TEXTO E EM SEGUIDA UM COMANDO EM JSON. COMANDO SEMPRE EM INGLÊS E VOZES SEMPRE EM PORTUGUÊS BR.', tags: null, is_favorite: false, created_at: '2026-01-26T15:38:34Z' },
      { id: 'b2082845', category_id: null, title: 'CHARACTER SHEET 1', content: 'Crie uma ficha de personagem profissional. Fileira superior: vista frontal, perfil esquerdo, perfil direito, traseira. Fileira inferior: três retratos em close-up. Mantenha a identidade do personagem em perfeita consistência em todos os quadros.', tags: null, is_favorite: false, created_at: '2026-04-12T06:27:05Z' },
      { id: 'b3c11c22', category_id: null, title: 'KLING 2', content: 'CHAT A PARTIR DE AGORA VOÇÊ É UM PRODUTOR CINEMATÓGRÁFICO, FAREMOS UM PROJETO DE VIDEO COM IA USANDO O KLING. EU IREI ENVIAR IMAGENS E EM SEGUIDA VOCÊ ANALISA, MAPEIA TODO O CENÁRIO E CRIA UM COMANDO APRIMORADO PARA O KLING. CRIE UM COMANDO EM INGLÊS.', tags: null, is_favorite: false, created_at: '2026-02-05T05:58:12Z' },
      { id: 'c117feb9', category_id: null, title: 'TRAVA DE IDENTIDADE', content: 'USE AS IMAGENS ANEXADAS COMO REFERÊNCIA ABSOLUTA E IRRESTRITA DE IDENTIDADE DOS DOIS INDIVÍDUOS. IDENTITY LOCK: Manter 100% a estrutura facial original, preservar formato do crânio, mandíbula, maxilar e proporções, manter exatamente o mesmo tom e textura de pele, preservar cabelo, não alterar idade aparente, não modificar etnia, realismo fotográfico extremo.', tags: null, is_favorite: false, created_at: '2026-03-03T19:27:53Z' },
      { id: 'c50c75ce', category_id: null, title: 'CHARACTER SHEET', content: `Crie uma ficha de referência profissional para o personagem, baseada estritamente na imagem de referência enviada. Utilize um fundo neutro e limpo e apresente a ficha como uma representação técnica em 360º, mantendo o mesmo estilo visual da referência (mesmo nível de realismo, abordagem de renderização, textura, tratamento de cores e estética geral). Organize a composição em duas fileiras horizontais. Fileira superior: quatro vistas de corpo inteiro em pé, lado a lado, nesta ordem: vista frontal, vista de perfil esquerdo (voltado para a esquerda), vista de perfil direito (voltado para a direita) e vista traseira. Fileira inferior: três retratos em close-up altamente detalhados, alinhados abaixo da fileira de corpo inteiro, nesta ordem: retrato frontal, retrato de perfil esquerdo (voltado para a esquerda) e retrato de perfil direito (voltado para a direita). Mantenha a consistência perfeita da identidade visual em todos os painéis. Mantenha o personagem em uma pose relaxada em "A", com escala e alinhamento consistentes entre as vistas, anatomia precisa e silhueta nítida; assegure espaçamento uniforme e separação clara entre os painéis, com enquadramento uniforme e altura da cabeça consistente em todas as vistas de corpo inteiro, e escala facial consistente em todos os retratos. A iluminação deve ser consistente em todos os painéis (mesma direção, intensidade e suavidade), com sombras naturais e controladas que preservem os detalhes sem mudanças bruscas de atmosfera. O resultado final deve ser uma folha de referência nítida e pronta para impressão, com detalhes precisos.`, tags: null, is_favorite: false, created_at: '2026-04-12T06:27:58Z' },
      { id: 'e32fb270', category_id: null, title: 'ILUMINAÇÃO VENOM', content: `Realizar aprimoramento fotográfico profissional mantendo **trava total de características do indivíduo**, preservando exatamente **mesma pose, mesmo enquadramento, mesmo ângulo de câmera, mesma expressão e proporções corporais**, sem alterar composição estrutural da imagem.
Aplicar **fundo escuro profundo com atmosfera cinematográfica**, criando sensação de ambiente dark elegante e realista.
Inserir **iluminação vermelha neon na tonalidade REX 860000**, posicionada em backlight e rim light suave, formando um **contorno luminoso sutil ao redor da silhueta do indivíduo**, simulando luz prática real de estúdio.
A luz deve gerar **reflexos realistas na pele, roupa e elementos metálicos**, com gradiente natural e difusão suave, evitando efeito artificial ou exagerado.
Criar **profundidade cinematográfica com contraste controlado**, sombras ricas e iluminação lateral estilo documentário premium.
Adicionar leve **bloom neon controlado**, volumetric light discreto e integração ambiental para sensação de realismo físico.
Aplicar **texturas ultra realistas**, evidenciando poros da pele, micro detalhes de tecido, desgaste natural e highlights especulares realistas.
Estética de câmera profissional: **lente cine prime f/1.8**, leve aberração cromática cinematográfica, profundidade de campo natural e nitidez seletiva no sujeito.
Resultado final com **qualidade ultra realista, padrão publicidade premium, iluminação de estúdio integrada ao ambiente**, sem modificar a essência original da imagem.`, tags: null, is_favorite: false, created_at: '2026-05-26T01:25:06Z' },
      { id: 'ec0d72ca', category_id: null, title: 'KLING 2.5', content: 'Ultra cinematic video, hyper-realistic, high dynamic range, natural color grading, professional film look, smooth motion, no distortion. Scene description: [DESCREVA A CENA AQUI]. Character action: [DESCREVA A AÇÃO]. Camera movement: [DESCREVA O MOVIMENTO]. Style inspired by high-end cinema production.', tags: null, is_favorite: false, created_at: '2026-01-28T01:19:16Z' },
    ],
    references: [
      { id: '0b8063ad', category_id: null, title: 'CARTOON MEME', description: 'Desenho animado 2D satírico extremo. Contornos imperfeitos desenhados à mão. Cores planas com pouco sombreamento. Estilo de animação de paródia adulta', image_url: 'https://itrcqzvzqewlaevtaruz.supabase.co/storage/v1/object/public/reference-images/2a02ae91-457b-41ec-8800-26ce301588ec/1771819384513-g7kcwn.jpg', thumbnail_url: 'https://itrcqzvzqewlaevtaruz.supabase.co/storage/v1/object/public/reference-images/2a02ae91-457b-41ec-8800-26ce301588ec/1771819384513-g7kcwn_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-02-23T04:03:17Z' },
      { id: '3543d78d', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: 'STOP MOTION MASSINHA', description: 'Cena stop-motion em massinha com oficina pequena, ferramentas e objetos moldados à mão com marcas de dedos e imperfeições típicas de argila', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756991263-zogbw.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756991263-zogbw_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T02:13:14Z' },
      { id: '3f4f2dbf', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: '3D RAPPER', description: `Transforme a foto de referência fornecida em um retrato de cabeça 3D hiperestilizado e cinematográfico.

O personagem deve preservar a estrutura facial, as proporções, o tom de pele, a expressão, o penteado e a identidade da pessoa original, adaptando-os a um visual 3D estilizado de alta qualidade, sem alterar a essência da pessoa.

Apenas a cabeça e a parte superior do pescoço devem estar visíveis, flutuando na cena, com o pescoço claramente truncado. A cabeça deve ocupar cerca de 75 a 85% do quadro, ligeiramente inclinada para uma composição dinâmica.

Expressão: intensa, confiante, poderosa (adaptada naturalmente da foto de referência).

Acessórios: permita elementos estilizados, como óculos de sol modernos, brincos, correntes, grills ou aparelhos ortodônticos, somente se combinarem ou complementarem a referência, sem alterar a essência da pessoa.

Iluminação: iluminação cinematográfica de estúdio com forte luz de contorno vinda de trás e luz frontal suave, criando destaques brilhantes, sombras profundas e reflexos realistas na pele e nos acessórios.

Materiais: superfícies 3D lisas, polidas e de alta qualidade com realismo sutil, sem aspecto plástico. A pele deve ter aparência premium e detalhada.

Fundo: fundo abstrato ou com fumaça atmosférica que complementa o sujeito sem distrair a atenção do rosto.

Estilo: retrato 3D hiperestilizado, cinematográfico, moderno, arrojado e extremamente limpo.

Qualidade: Ultra HD, 4K–8K, foco nítido, renderização profissional.`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756944721-pb17n.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756944721-pb17n_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-26T16:29:50Z' },
      { id: '4c303cc9', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: 'ESCULTURA', description: `**"Use a foto enviada como referência absoluta de identidade e pose.
Transforme a mesma pessoa em uma estátua de mármore clássica altamente realista, preservando 100% das características faciais originais, formato da cabeça, proporções corporais, pose, gestos e expressões da foto de referência.
NÃO altere o gênero, a idade, a estrutura facial ou a pose. O sujeito deve ser exatamente igual à pessoa original, apenas transformado em pedra.

A pele, o cabelo e as roupas devem parecer esculpidos em mármore clássico de alta qualidade, com textura de pedra realista, imperfeições sutis, microfissuras e marcas naturais de cinzel.
As roupas e os acessórios da foto original devem permanecer na mesma posição e formato, mas renderizados inteiramente como escultura em mármore.

A iluminação deve ser cinematográfica e escultural, com luz direcional suave enfatizando a profundidade, as sombras e os detalhes esculpidos, criando uma aparência de estátua com qualidade de museu.
O fundo deve ser escuro, minimalista e limpo, aumentando o contraste e a separação da estátua.

Texturas ultrarrealistas, foco nítido, composição cinematográfica profissional, alto nível de detalhes, estética de escultura de museu, material de pedra realista, sem Estilização, sem desenho animado, sem abstração."**`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779758125385-gs604.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779758125385-gs604_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-05-26T01:14:38Z' },
      { id: '4ec8113a', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: '3D EXAGERADO', description: `[PEDIDO] TRANSFORME ESSA IMAGEM EM Um retrato estilizado em 3D de um personagem com proporções exageradas de desenho animado.
Sua pele é detalhada e texturizada com poros realistas,
rugas sutis e
imperfeições naturais.
A cabeça tem um formato alongado com um nariz grande e arredondado, lábios proeminentes e um
olhar de soslaio ligeiramente
cético

[Melhorar composição] Com composições mais profissionais como de um diretor de fotografia: Regra dos terços, proporção áurea, bem como os filmes premiados.

[Consistência] Mantenha o personagen. Apenas mude a ação para posição que foi pedido.
[Mais realismo] Quero texturas no personagem, poros na pele, leves imperfeições, textura na roupa e brilhos realistas.

[Melhorar estética de câmera] Lente cine f1.8 com aberração cromática`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757005689-zf82e.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757005689-zf82e_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T01:52:28Z' },
      { id: '501da764', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: 'ANIMAÇÃO UNIVERSOS', description: 'Frame de animação 3D com texturas detalhadas, estética de ilustração e atmosfera realista, mostrando um pequeno robô amarelo desgastado sentado de pernas cruzadas em um ambiente urbano improvisado, segurando um papelão com símbolo de bateria, enquadramento aproximado com foco no personagem e fundo grafitado levemente desfocado, sob luz suave refletindo na viseira e destacando arranhões e detalhes metálicos, transmitindo uma sensação melancólica porém cativante. Seguindo o padrão visual da imagem de referência', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757019934-qhmuc.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757019934-qhmuc_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T02:18:28Z' },
      { id: '56981225', category_id: null, title: 'DRAMA', description: 'Transforme qualquer foto de retrato em uma obra de arte cinematográfica hiperdetalhada. Foque no rosto com detalhes nítidos, texturas naturais da pele, sardas visíveis e olhos expressivos. Envolva o sujeito com elementos dramáticos como papel em chamas, luz brilhante ou texturas abstratas. Iluminação quente, fundo com bokeh suave, sombras cinematográficas e reflexos de lente sutis. Mantenha as feições e a pose originais do rosto. Artístico, melancólico, fotorrealista, alta resolução, 8K, ultradetalhado. Estilo que une fotografia cinematográfica e ilustração artística.', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779758282967-nx5hw.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779758282967-nx5hw_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-05-26T01:17:10Z' },
      { id: '5e65535e', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: '3D ARTESANAL', description: 'A stylized 3D animated scene with a strong hand-crafted aesthetic, featuring a young man leaning intensely over a DJ mixer, captured from a dramatic low-angle close-up that exaggerates the size and motion of his hands; the rendering blends sculpted 3D depth with painterly textures, visible brush marks, and slightly imperfect linework reminiscent of hand-drawn animation; warm sunset lighting floods the scene with golden and magenta tones, adding soft rim highlights around his headphones, hair, and fingers, while subtle chromatic aberration and shallow depth of field enhance the cinematic feel; the background structures, including a water tower, appear softly stylized and lightly blurred, emphasizing his focused expression and dynamic gesture as he manipulates the controls.', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756973660-slrv3.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756973660-slrv3_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T02:10:49Z' },
      { id: '6f1cb7d3', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: 'ANIMAÇÃO 2D MUNDO REAL', description: 'A realistic backyard scene captured with warm late-afternoon sunlight filtering through dense trees, contrasted by two lively 2D cartoon characters seamlessly composited into the environment, featuring flat colors, thick outlines, and expressive exaggerated poses; the real setting includes an old red car, hanging laundry lines, weathered brick buildings, and soft natural shadows, while the cartoons retain their classic hand-drawn look without interacting with the lighting of the real world, creating a playful nostalgic blend where animation characters appear to casually exist within a lived-in, atmospheric neighborhood.', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756906896-fvri2.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756906896-fvri2_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T02:01:48Z' },
      { id: '7495e1fa', category_id: '71556972-14a8-47ec-b0c0-6919623cd31e', title: 'UP SCALE 1', description: `"Recreate the provided image in 4K, maintaining the key elements and enhancing every detail with a hyperrealistic approach. Increase the resolution so that fine details are visibly sharp, such as skin textures, clothing, landscapes, or any surface in the photo. The colors should be vibrant and precise, emphasizing depth and light. Ensure the lighting highlights the most detailed features, creating soft, accurate shadows for a realistic look. The image should maintain a professional level of quality, with details capturing even the smallest elements, from textures to reflections on metal or water surfaces."`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757037690-vfcxzg.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757037690-vfcxzg_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T01:46:16Z' },
      { id: '76d845c3', category_id: '71556972-14a8-47ec-b0c0-6919623cd31e', title: 'UP SCALE COM ILUMINAÇÃO', description: 'Transforme a imagem original em uma fotografia cinematográfica de alta resolução e atmosfera melancólica, mantendo fidelidade absoluta às características faciais, pose e gênero do sujeito original. Mantenha a pose da pessoa exatamente igual à da imagem real. Realize um aumento de escala hiper-realista, trazendo o sujeito para um foco extremamente nítido. Aprimore e refine significativamente a textura da pele para que fique incrivelmente detalhada e realista, mostrando poros visíveis, linhas finas e definição realista. Aplique uma iluminação de fundo dramática e discreta que projete tons intensos de laranja quente e âmbar profundo como fonte de luz dominante, criando uma forte luz de contorno e um brilho quente ao redor da silhueta. As sombras devem ser profundamente pretas, com distintos tons frios de verde-azulado e verde-escuro suaves visíveis nas áreas mais escuras do fundo. Adicione uma textura de granulação de filme analógico autêntica e marcante em toda a imagem. Profundidade de campo rasa, iluminação de alto contraste em claro-escuro, estética cinematográfica atmosférica, emocional e sombria.', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756957090-uyz1s.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756957090-uyz1s_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-26T16:27:26Z' },
      { id: '7a84e73b', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: 'ANIMAÇÃO COM BRILHO', description: 'A hyper-detailed macro shot of a baby sea turtle rendered in a luminous, cinematic 3D style, with extremely close focus on its glossy expressive eyes, translucent skin textures, and intricate shell patterns; vibrant bioluminescent purples, blues, and pinks illuminate the underwater plants surrounding it, creating soft glowing highlights across its tiny limbs; shallow macro depth of field produces creamy bokeh and floating bubbles catching specular reflections, while gentle volumetric light filters through the foliage, enhancing the magical underwater atmosphere with crisp micro-details and a dreamy, high-end animated look.', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756935763-w31tpo.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756935763-w31tpo_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T02:06:57Z' },
      { id: '7bb9a037', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: 'MANGÁ', description: `Transform the uploaded photo into an authentic manga / anime scene featuring a male protagonist.
Preserve the subject's identity exactly, including pose, facial expression, body proportions, hairstyle, clothing, accessories, colors, and overall composition.
Convert the subject into a high-detail anime/manga character style inspired by modern Japanese animation and cinematic manga panels clean cel-shading with soft gradients.
The image must look like a frame from a high-budget anime or a dramatic manga splash panel, not a cartoon or chibi style.
Use cinematic anime lighting with:
strong rim light
dramatic shadows
glowing highlights
volumetric light rays or speed lines if appropriate
Apply dynamic manga composition:
exaggerated perspective
motion lines
impact streaks
wind or cloth movement
particles rain`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756924582-ptds0q.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756924582-ptds0q_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-26T16:49:05Z' },
      { id: '80f4ed0d', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: '3D BASE', description: `[Pedido] Mude para [Estilo de animação 3d de filme] traços levemente de cartoon mas com texturas e detalhes.

[Melhorar composição] Com composições mais profissionais como de um diretor de fotografia: Regra dos terços, proporção áurea, bem como os filmes premiados.

[Iluminação] A luz é realista e cinematográfica da luz de um amanhecer, sempre gravado do lado da sombra, como em um documentário

[Consistência] Mantenha os personagens. Apenas mude a ação para posição que foi pedido.

[Mais realismo] Quero texturas no personagem, poros na pele, leves imperfeições, textura na roupa desgaste, ferrugem nas partes de metal e brilhos realistas.

[Melhorar estética de câmera] Lente cine f1.8 com aberração cromática`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756800395-3iisbz9.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756800395-3iisbz9_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-27T02:34:39Z' },
      { id: '8986d9de', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: 'EVOLUÇÃO', description: 'Crie um tríptico de progressão de idade altamente realista com base na foto de referência fornecida. Preserve a identidade facial: estrutura óssea, olhos, nariz, lábios, proporções, tom de pele e essência geral. Esquerda: CRIANÇA (8-10 anos). Centro: JOVEM ADULTO (20-30 anos). Direita: IDOSO (65-80 anos). Fotografia ultrarrealista, retrato de estúdio, fundo preto puro, iluminação profissional, lente 85mm f/2-f/4, Ultra HD 16:9.', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779758519634-b0v34.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779758519634-b0v34_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-05-26T01:21:09Z' },
      { id: '89d9dfc9', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: '3D FELTRO', description: `[Pedido] Mude para Personagem 3D estilizado com textura de feltro suave, inspirada em stop-motion, apresentando fios visíveis na pele, no suéter e no cabelo, criando um visual artesanal e tátil

[Melhorar composição] Com composições mais profissionais como de um diretor de fotografia: Regra dos terços, proporção áurea, bem como os filmes premiados.

[Consistência] Mantenha o personagen. Apenas mude a ação para posição que foi pedido.`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756817230-x3mxn5.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756817230-x3mxn5_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T02:09:08Z' },
      { id: '938035d0', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: '3D AGRESSIVE 8K', description: `[1]Recrie esta imagem com qualidade ultra alta (8K), hiper nítida e extremamente realista.

[2]Preserve fielmente todas as características do personagem, proporções faciais, textura da pele, detalhes dos olhos e cabelo.

[3]Aplique realismo fotográfico avançado, com sombras naturais, profundidade de campo precisa, cores equilibradas e alto nível de detalhes, Com composições mais profissionais como de um diretor de fotografia: Regra dos terços, proporção áurea, bem como os filmes premiados.

[4] Quero texturas no personagem, poros na pele, leves imperfeições, textura na roupa e brilhos realistas.

[5] Mantenha o personagem. Apenas mude o que foi pedido.

[5] A luz é realista e cinematográfica da luz de um amanhecer, sempre gravado do lado da sombra, como em um documentário

[6] Lente cine f1.8 com aberração cromática`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757473218-maxycz.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757473218-maxycz_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-20T23:05:26Z' },
      { id: '96940967', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: '3D PINTURA', description: 'A stylized 3D illustration of a young woman walking directly toward the camera in a medium close-up, struggling to carry a large drum in her arms, her face exaggerated into a caricatured, humorous expression that enhances the animated feel; painted-by-hand aesthetics with visible brush strokes, soft texture breakup, and intentionally imperfect edges give the scene a handcrafted look; warm sunset backlight wraps around her silhouette, creating glowing highlights on her hair, cheeks, and the rim of the drum; subtle volumetric shading adds depth while the parked scooter remains in the softly blurred background, tinted by the same golden atmospheric light, blending painterly stylization with cinematic sunset realism.', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756870069-r0akg9.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756870069-r0akg9_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T02:07:46Z' },
      { id: 'a4734a7b', category_id: 'ff4aa6f6-97d4-4bf6-a4d3-7b930693b4d6', title: 'VARIAÇÕES DE CENA', description: `Crie varias imagens, de detalhes dessa mesma imagem, mostrando detalhes de cada personagem ou de algo da ação.
Quero variação de enquadramentos, planos mais ricos como:  plano geral, over the shoulder, planos macro, primeiro plano focado, primeiro plano desfocado. Sem alterar a cena. personagens devem estar no mesmo lugar.
Com composições mais profissionais como de um diretor de fotografia: Regra dos terços, proporção áurea, bem como os filmes premiados.
Mantenha os mesmos personagem.
A luz é realista, sempre gravado do lado da sombra, como em um documentário
Mantenha o estilo da imagem de referência, como se tudo fosse parte de um mesmo filme.
Quero texturas no personagem, detalhes na pele, leves imperfeições, textura na roupa e brilhos realistas.
Lente 35mm f1.8 com aberração cromática`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757424172-in1rsv.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757424172-in1rsv_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T01:58:03Z' },
      { id: 'c9cf8f90', category_id: 'ff4aa6f6-97d4-4bf6-a4d3-7b930693b4d6', title: 'CINEMÁTICO CÉU', description: 'Cena cinematográfica ultrarrealista com personagem flutuando acima das nuvens. Preserve características faciais, roupas e identidade exatos da referência. Qualidade 4K', image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756852582-hg9n29.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756852582-hg9n29_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-26T18:15:59Z' },
      { id: 'cd683975', category_id: '0f05c079-8170-489c-a800-9b54b3ad9795', title: 'CALL OF DUTY STYLE', description: `Transform the provided reference photo into a 3D Call of Duty: Warzone–style skin while maintaining all the unique facial features, expression, and body proportions from the reference.

The clothing should be preserved in its original form, whether it's a bikini, casual wear, or any other type of outfit — but the outfit must be seamlessly integrated into a realistic, tactical Warzone skin.

Style the character as an FPS operator in next-gen 3D graphics, using high-quality textures, lighting, and realistic shaders for skin, clothing, and accessories.

Camera: medium or full-body shot, emphasizing the 3D realism of the character.
Lighting: cinematic, highlighting the character's features and outfit in a Warzone-style atmosphere.
Mood: elite operator, realistic, immersive.
Style: AAA videogame character, ultra-realistic 3D, with tactical details.
Quality: Ultra HD, 4K–8K, sharp focus, game-ready render.`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756897052-mc53ri.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779756897052-mc53ri_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-26T18:12:12Z' },
      { id: 'f31a4d82', category_id: '71556972-14a8-47ec-b0c0-6919623cd31e', title: 'UP SCALE 2', description: `[Recrie a imagem em altíssima resolução, aprimorando o realismo e os microdetalhes, mantendo o personagem perfeitamente consistente com a referência. Preserve a identidade facial, as proporções e o estilo geral com fidelidade absoluta.

Aprimore a qualidade dos materiais: adicione texturas de tecido mais realistas (trama, costura, dobras) e melhore as superfícies do ambiente (materiais, reflexos, rugosidade, profundidade) sem alterar a cena.

NÃO altere a composição, o ângulo da câmera, o enquadramento, o cenário, a pose ou a ação. Tudo deve permanecer idêntico; apenas refine a qualidade dos detalhes e o realismo.

Mantenha a mesma iluminação realista de documentário, filmada do lado da sombra, com contraste natural e realces sutis.

Use uma aparência cinematográfica de câmera/lente (profundidade de campo rasa, bokeh natural). Mantenha o ambiente e a iluminação originais exatamente iguais.]`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757052495-j65kwp.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779757052495-j65kwp_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-01-21T01:57:09Z' },
      { id: 'f81c81d9', category_id: null, title: 'VETOR', description: `Crie um ícone de mascote vetorial limpo e de alto contraste, baseado apenas na pessoa da foto de referência. Mostre apenas a cabeça em uma vista de 3/4 (voltada para a direção mais natural de acordo com a foto). Use um contorno externo preto marcante e preenchimentos monocromáticos planos.
Estilize todas as características visíveis exatamente como aparecem na imagem de referência: reproduza o penteado ou calvície reais, pelos faciais (se presentes), óculos (somente se presentes), formato da orelha, formato dos olhos, nariz, boca e contorno geral da cabeça. Não invente, exagere ou adicione quaisquer elementos que não estejam presentes na foto original.
Use uma expressão amigável, no estilo de desenho animado, que combine com a vibração natural do sujeito, neutra se for neutra. Os dentes devem aparecer apenas se estiverem visíveis na referência. Os olhos devem ser simplificados, mas fiéis, com íris pretas grandes e reflexos mínimos.
A pele deve ser totalmente branca, sem gradientes, sombreamento ou textura. Mantenha linhas externas grossas e detalhes internos mais finos para uma aparência limpa e pronta para logotipo, inspirada no design moderno de mascotes e no estilo de desenho animado "rubber-hose". Coloque a cabeça sobre um fundo cinza sólido (#5A5A5A), sem pescoço, sem corpo e sem elementos extras.
Use apenas preto, branco e cinza. Sem cor, sem sombras, sem texturas, sem efeitos de iluminação, sem 3D e sem detalhes de fundo.`, image_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779758355557-q54xf2.jpg', thumbnail_url: 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33/1779758355557-q54xf2_thumb.jpg', tags: null, is_favorite: false, created_at: '2026-05-26T01:18:25Z' },
    ],
  }
}

function load(): AgenciaData {
  if (typeof window === 'undefined') return createSeedData()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = createSeedData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
  return JSON.parse(raw)
}

function save(data: AgenciaData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getCategories(): Category[] { return load().categories }
export function getAllReferences(): Reference[] { return load().references }
export function getPrompts(): Prompt[] { return load().prompts }

export function toggleFavoriteRef(id: string) {
  const data = load()
  const ref = data.references.find(r => r.id === id)
  if (ref) ref.is_favorite = !ref.is_favorite
  save(data)
}

export function toggleFavoritePrompt(id: string) {
  const data = load()
  const p = data.prompts.find(p => p.id === id)
  if (p) p.is_favorite = !p.is_favorite
  save(data)
}

// ============================================
// PROMPT CRUD
// ============================================

export function createPrompt(prompt: Omit<Prompt, 'id' | 'created_at' | 'is_favorite'>): Prompt {
  const data = load()
  const item: Prompt = { ...prompt, id: uid(), is_favorite: false, created_at: new Date().toISOString() }
  data.prompts.push(item)
  save(data)
  return item
}

export function updatePrompt(id: string, updates: Partial<Pick<Prompt, 'title' | 'content' | 'category_id' | 'tags'>>) {
  const data = load()
  const p = data.prompts.find(p => p.id === id)
  if (p) Object.assign(p, updates)
  save(data)
}

export function deletePrompt(id: string) {
  const data = load()
  data.prompts = data.prompts.filter(p => p.id !== id)
  save(data)
}

// ============================================
// REFERENCE CRUD
// ============================================

export function createReference(ref: Omit<Reference, 'id' | 'created_at' | 'is_favorite'>): Reference {
  const data = load()
  const item: Reference = { ...ref, id: uid(), is_favorite: false, created_at: new Date().toISOString() }
  data.references.push(item)
  save(data)
  return item
}

export function updateReference(id: string, updates: Partial<Pick<Reference, 'title' | 'description' | 'category_id' | 'image_url' | 'thumbnail_url' | 'tags'>>) {
  const data = load()
  const r = data.references.find(r => r.id === id)
  if (r) Object.assign(r, updates)
  save(data)
}

export function deleteReference(id: string) {
  const data = load()
  data.references = data.references.filter(r => r.id !== id)
  save(data)
}

// ============================================
// CATEGORY CRUD
// ============================================

export function createCategory(name: string, color: string): Category {
  const data = load()
  const cat: Category = { id: uid(), name, color, icon: 'folder' }
  data.categories.push(cat)
  save(data)
  return cat
}

export function deleteCategory(id: string) {
  const data = load()
  data.references.forEach(r => { if (r.category_id === id) r.category_id = null })
  data.categories = data.categories.filter(c => c.id !== id)
  save(data)
}

export function resetAgencia() {
  const seed = createSeedData()
  save(seed)
}
