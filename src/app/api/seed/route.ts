import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const uid = user.id

  // ============ AGÊNCIA: Categories ============
  const catAnimacoes = crypto.randomUUID()
  const catUpscale = crypto.randomUUID()
  const catStoryTelling = crypto.randomUUID()

  await supabase.from('ag_categories').upsert([
    { id: catAnimacoes, user_id: uid, name: 'ESTILO DE ANIMAÇÕES', color: '#ec4899', icon: 'folder' },
    { id: catUpscale, user_id: uid, name: 'UP SCALE', color: '#3b82f6', icon: 'folder' },
    { id: catStoryTelling, user_id: uid, name: 'VARIAÇÃO STORY TELLING', color: '#14b8a6', icon: 'folder' },
  ], { onConflict: 'id' })

  // Delete existing agencia data to avoid duplicates
  await supabase.from('ag_prompts').delete().eq('user_id', uid)
  await supabase.from('ag_references').delete().eq('user_id', uid)

  // ============ AGÊNCIA: All 11 Prompts ============
  const prompts = [
    { title: 'ILUMINAÇÃO C4', content: "RECRIE ESSA IMAGEM APLICANDO REALISMO FOTOGRÁFICO MANTENDO TRAVA ABSOLUTA DE IDENTIDADE\n **fundo escuro profundo com atmosfera cinematográfica, criando sensação de ambiente dark elegante e realista.**\n**iluminação amarela neon na tonalidade quente, posicionada em backlight e rim light suave, formando um contorno luminoso sutil ao redor da silhueta do indivíduo, simulando luz prática real de estúdio.**\n**A luz deve gerar reflexos realistas na pele, roupa e elementos metálicos, com gradiente natural e difusão suave, evitando efeito artificial ou exagerado.**\n**CRIAR profundidade cinematográfica com contraste controlado**, sombras ricas e iluminação lateral estilo documentário premium.\nAdicionar leve **bloom neon controlado**, volumetric light discreto e integração ambiental para sensação de realismo físico.\nAplicar **texturas ultra realistas**, evidenciando poros da pele com micro detalhes,e highlights especulares realistas.\nEstética de câmera profissional: **lente cine prime f/1.8**, leve aberração cromática cinematográfica, profundidade de campo natural e nitidez seletiva no sujeito.\nResultado final com **qualidade ultra realista, padrão publicidade premium, iluminação de estúdio integrada ao ambiente**, sem modificar a essência original da imagem." },
    { title: 'ILUMINAÇÃO ZENITH', content: "RECRIE ESSA IMAGEM APLICANDO REALISMO FOTOGRÁFICO MANTENDO TRAVA ABSOLUTA DE IDENTIDADE\n **fundo escuro profundo com atmosfera cinematográfica, criando sensação de ambiente dark elegante e realista.**\n**iluminação branca neon na tonalidade fria, posicionada em backlight e rim light suave, formando um contorno luminoso sutil ao redor da silhueta do indivíduo, simulando luz prática real de estúdio.**\n**A luz deve gerar reflexos realistas na pele, roupa e elementos metálicos, com gradiente natural e difusão suave, evitando efeito artificial ou exagerado.**\n**CRIAR profundidade cinematográfica com contraste controlado**, sombras ricas e iluminação lateral estilo documentário premium.\nAdicionar leve **bloom neon controlado**, volumetric light discreto e integração ambiental para sensação de realismo físico.\nAplicar **texturas ultra realistas**, evidenciando poros da pele com micro detalhes,e highlights especulares realistas.\nEstética de câmera profissional: **lente cine prime f/1.8**, leve aberração cromática cinematográfica, profundidade de campo natural e nitidez seletiva no sujeito.\nResultado final com **qualidade ultra realista, padrão publicidade premium, iluminação de estúdio integrada ao ambiente**, sem modificar a essência original da imagem." },
    { title: 'SUNO', content: 'Reescreva a musica a cima mantendo a fonetica, a cadência e a estrutura' },
    { title: 'CYBER PUNK', content: "Transforme-se em um retrato no estilo cyberpunk com luzes de néon e elementos futuristas \"\nas luzes neon devem ter a cor dourada, a pessoa da foto se transforma em um ciborg humanoide, a imagem deve ser ultra realista render 8k.\nmantenha perfeitamente as caracteristicas do porte fisico com fidelidade e textura ultra realista na pele e tecido da roupa com a mesma pose da foto\nCom composições mais profissionais como de um diretor de fotografia: Regra dos terços, proporção áurea, bem como os filmes premiados.\nMantenha o mesmo individuo com 100% de fidelidade.\nA luz é realista, ,como em um filme.\nQuero texturas no personagem, detalhes na pele, leves imperfeições, textura na roupa e brilhos realistas.\nLente 35mm f1.8 com aberração cromática" },
    { title: 'COMANDO VEO3', content: 'CHAT A PARTIR DE AGORA VOÇÊ É UM PRODUTOR CINEMATÓGRÁFICO, FAREMOS UM PROJETO DE VIDEO COM IA USANDO O VEO3. EU IREI ENVIAR IMAGENS E EM SEGUIDA VOCÊ ANALISA E CRIA UM COMANDO APRIMORADO COM A MELHOR LINGUAGEM DE COMANDO PARA VEO3. ESCOLHA A MELHOR CÂMERA E LENTE PARA GRAVAÇÕES CINEMATOGRÁFICAS. CRIE UM COMANDO EM TEXTO E EM SEGUIDA UM COMANDO EM JSON. COMANDO SEMPRE EM INGLÊS E VOZES SEMPRE EM PORTUGUÊS BR.' },
    { title: 'CHARACTER SHEET 1', content: 'Crie uma ficha de personagem profissional. Fileira superior: vista frontal, perfil esquerdo, perfil direito, traseira. Fileira inferior: três retratos em close-up. Mantenha a identidade do personagem em perfeita consistência em todos os quadros.' },
    { title: 'KLING 2', content: 'CHAT A PARTIR DE AGORA VOÇÊ É UM PRODUTOR CINEMATÓGRÁFICO, FAREMOS UM PROJETO DE VIDEO COM IA USANDO O KLING. EU IREI ENVIAR IMAGENS E EM SEGUIDA VOCÊ ANALISA, MAPEIA TODO O CENÁRIO E CRIA UM COMANDO APRIMORADO PARA O KLING. CRIE UM COMANDO EM INGLÊS.' },
    { title: 'TRAVA DE IDENTIDADE', content: 'USE AS IMAGENS ANEXADAS COMO REFERÊNCIA ABSOLUTA E IRRESTRITA DE IDENTIDADE DOS DOIS INDIVÍDUOS. IDENTITY LOCK: Manter 100% a estrutura facial original, preservar formato do crânio, mandíbula, maxilar e proporções, manter exatamente o mesmo tom e textura de pele, preservar cabelo, não alterar idade aparente, não modificar etnia, realismo fotográfico extremo.' },
    { title: 'CHARACTER SHEET', content: "Crie uma ficha de referência profissional para o personagem, baseada estritamente na imagem de referência enviada. Utilize um fundo neutro e limpo e apresente a ficha como uma representação técnica em 360º, mantendo o mesmo estilo visual da referência (mesmo nível de realismo, abordagem de renderização, textura, tratamento de cores e estética geral). Organize a composição em duas fileiras horizontais. Fileira superior: quatro vistas de corpo inteiro em pé, lado a lado, nesta ordem: vista frontal, vista de perfil esquerdo (voltado para a esquerda), vista de perfil direito (voltado para a direita) e vista traseira. Fileira inferior: três retratos em close-up altamente detalhados, alinhados abaixo da fileira de corpo inteiro, nesta ordem: retrato frontal, retrato de perfil esquerdo (voltado para a esquerda) e retrato de perfil direito (voltado para a direita). Mantenha a consistência perfeita da identidade visual em todos os painéis. Mantenha o personagem em uma pose relaxada em \"A\", com escala e alinhamento consistentes entre as vistas, anatomia precisa e silhueta nítida; assegure espaçamento uniforme e separação clara entre os painéis, com enquadramento uniforme e altura da cabeça consistente em todas as vistas de corpo inteiro, e escala facial consistente em todos os retratos. A iluminação deve ser consistente em todos os painéis (mesma direção, intensidade e suavidade), com sombras naturais e controladas que preservem os detalhes sem mudanças bruscas de atmosfera. O resultado final deve ser uma folha de referência nítida e pronta para impressão, com detalhes precisos." },
    { title: 'ILUMINAÇÃO VENOM', content: "Realizar aprimoramento fotográfico profissional mantendo **trava total de características do indivíduo**, preservando exatamente **mesma pose, mesmo enquadramento, mesmo ângulo de câmera, mesma expressão e proporções corporais**, sem alterar composição estrutural da imagem.\nAplicar **fundo escuro profundo com atmosfera cinematográfica**, criando sensação de ambiente dark elegante e realista.\nInserir **iluminação vermelha neon na tonalidade REX 860000**, posicionada em backlight e rim light suave, formando um **contorno luminoso sutil ao redor da silhueta do indivíduo**, simulando luz prática real de estúdio.\nA luz deve gerar **reflexos realistas na pele, roupa e elementos metálicos**, com gradiente natural e difusão suave, evitando efeito artificial ou exagerado.\nCriar **profundidade cinematográfica com contraste controlado**, sombras ricas e iluminação lateral estilo documentário premium.\nAdicionar leve **bloom neon controlado**, volumetric light discreto e integração ambiental para sensação de realismo físico.\nAplicar **texturas ultra realistas**, evidenciando poros da pele, micro detalhes de tecido, desgaste natural e highlights especulares realistas.\nEstética de câmera profissional: **lente cine prime f/1.8**, leve aberração cromática cinematográfica, profundidade de campo natural e nitidez seletiva no sujeito.\nResultado final com **qualidade ultra realista, padrão publicidade premium, iluminação de estúdio integrada ao ambiente**, sem modificar a essência original da imagem." },
    { title: 'KLING 2.5', content: 'Ultra cinematic video, hyper-realistic, high dynamic range, natural color grading, professional film look, smooth motion, no distortion. Scene description: [DESCREVA A CENA AQUI]. Character action: [DESCREVA A AÇÃO]. Camera movement: [DESCREVA O MOVIMENTO]. Style inspired by high-end cinema production.' },
  ]

  await supabase.from('ag_prompts').insert(prompts.map(p => ({ ...p, user_id: uid, category_id: null, tags: null, is_favorite: false })))

  // ============ AGÊNCIA: All 22 References ============
  const SB = 'https://zlgrldwsugfksvrsyqsn.supabase.co/storage/v1/object/public/reference-images/8318562e-2ad6-4719-9574-19b1d9e00c33'
  const refs = [
    { title: 'CARTOON MEME', description: 'Desenho animado 2D satírico extremo. Contornos imperfeitos desenhados à mão. Cores planas com pouco sombreamento. Estilo de animação de paródia adulta', category_id: null, image_url: 'https://itrcqzvzqewlaevtaruz.supabase.co/storage/v1/object/public/reference-images/2a02ae91-457b-41ec-8800-26ce301588ec/1771819384513-g7kcwn.jpg', thumbnail_url: 'https://itrcqzvzqewlaevtaruz.supabase.co/storage/v1/object/public/reference-images/2a02ae91-457b-41ec-8800-26ce301588ec/1771819384513-g7kcwn_thumb.jpg' },
    { title: 'STOP MOTION MASSINHA', description: 'Cena stop-motion em massinha com oficina pequena, ferramentas e objetos moldados à mão com marcas de dedos e imperfeições típicas de argila', category_id: catAnimacoes, image_url: `${SB}/1779756991263-zogbw.jpg`, thumbnail_url: `${SB}/1779756991263-zogbw_thumb.jpg` },
    { title: '3D RAPPER', description: 'Retrato de cabeça 3D hiperestilizado e cinematográfico, preservando identidade facial', category_id: catAnimacoes, image_url: `${SB}/1779756944721-pb17n.jpg`, thumbnail_url: `${SB}/1779756944721-pb17n_thumb.jpg` },
    { title: 'ESCULTURA', description: 'Estátua de mármore clássica altamente realista, preservando 100% das características faciais originais', category_id: catAnimacoes, image_url: `${SB}/1779758125385-gs604.jpg`, thumbnail_url: `${SB}/1779758125385-gs604_thumb.jpg` },
    { title: '3D EXAGERADO', description: 'Retrato estilizado em 3D com proporções exageradas de desenho animado, pele detalhada com poros realistas', category_id: catAnimacoes, image_url: `${SB}/1779757005689-zf82e.jpg`, thumbnail_url: `${SB}/1779757005689-zf82e_thumb.jpg` },
    { title: 'ANIMAÇÃO UNIVERSOS', description: 'Frame de animação 3D com texturas detalhadas, estética de ilustração e atmosfera realista, robô amarelo desgastado', category_id: catAnimacoes, image_url: `${SB}/1779757019934-qhmuc.jpg`, thumbnail_url: `${SB}/1779757019934-qhmuc_thumb.jpg` },
    { title: 'DRAMA', description: 'Transforme qualquer foto de retrato em uma obra de arte cinematográfica hiperdetalhada. Elementos dramáticos como papel em chamas, luz brilhante ou texturas abstratas. Iluminação quente, fundo com bokeh suave.', category_id: null, image_url: `${SB}/1779758282967-nx5hw.jpg`, thumbnail_url: `${SB}/1779758282967-nx5hw_thumb.jpg` },
    { title: '3D ARTESANAL', description: 'Cena 3D estilizada com estética artesanal e texturas de pintura, warm sunset lighting', category_id: catAnimacoes, image_url: `${SB}/1779756973660-slrv3.jpg`, thumbnail_url: `${SB}/1779756973660-slrv3_thumb.jpg` },
    { title: 'ANIMAÇÃO 2D MUNDO REAL', description: 'Personagens cartoon 2D compostos em cenário real com luz de tarde quente', category_id: catAnimacoes, image_url: `${SB}/1779756906896-fvri2.jpg`, thumbnail_url: `${SB}/1779756906896-fvri2_thumb.jpg` },
    { title: 'UP SCALE 1', description: 'Recreate the provided image in 4K, maintaining the key elements and enhancing every detail with a hyperrealistic approach.', category_id: catUpscale, image_url: `${SB}/1779757037690-vfcxzg.jpg`, thumbnail_url: `${SB}/1779757037690-vfcxzg_thumb.jpg` },
    { title: 'UP SCALE COM ILUMINAÇÃO', description: 'Fotografia cinematográfica de alta resolução e atmosfera melancólica com iluminação laranja quente e âmbar profundo', category_id: catUpscale, image_url: `${SB}/1779756957090-uyz1s.jpg`, thumbnail_url: `${SB}/1779756957090-uyz1s_thumb.jpg` },
    { title: 'ANIMAÇÃO COM BRILHO', description: 'Tartaruga marinha bebê 3D luminosa com bioluminescência roxa, azul e rosa', category_id: catAnimacoes, image_url: `${SB}/1779756935763-w31tpo.jpg`, thumbnail_url: `${SB}/1779756935763-w31tpo_thumb.jpg` },
    { title: 'MANGÁ', description: 'Transformação em manga/anime cinematográfico com rim light, sombras dramáticas e composição dinâmica', category_id: catAnimacoes, image_url: `${SB}/1779756924582-ptds0q.jpg`, thumbnail_url: `${SB}/1779756924582-ptds0q_thumb.jpg` },
    { title: '3D BASE', description: 'Estilo de animação 3D de filme com traços cartoon, texturas realistas e iluminação cinematográfica', category_id: catAnimacoes, image_url: `${SB}/1779756800395-3iisbz9.jpg`, thumbnail_url: `${SB}/1779756800395-3iisbz9_thumb.jpg` },
    { title: 'EVOLUÇÃO', description: 'Tríptico de progressão de idade hiper-realista: criança, jovem adulto e idoso', category_id: catAnimacoes, image_url: `${SB}/1779758519634-b0v34.jpg`, thumbnail_url: `${SB}/1779758519634-b0v34_thumb.jpg` },
    { title: '3D FELTRO', description: 'Personagem 3D estilizado com textura de feltro suave, inspirada em stop-motion', category_id: catAnimacoes, image_url: `${SB}/1779756817230-x3mxn5.jpg`, thumbnail_url: `${SB}/1779756817230-x3mxn5_thumb.jpg` },
    { title: '3D AGRESSIVE 8K', description: 'Ultra alta qualidade 8K hiper nítida com realismo fotográfico avançado', category_id: catAnimacoes, image_url: `${SB}/1779757473218-maxycz.jpg`, thumbnail_url: `${SB}/1779757473218-maxycz_thumb.jpg` },
    { title: '3D PINTURA', description: 'Ilustração 3D estilizada com estética de pintura artesanal e warm sunset backlight', category_id: catAnimacoes, image_url: `${SB}/1779756870069-r0akg9.jpg`, thumbnail_url: `${SB}/1779756870069-r0akg9_thumb.jpg` },
    { title: 'VARIAÇÕES DE CENA', description: 'Detalhes de cena com variação de enquadramentos: plano geral, over the shoulder, planos macro', category_id: catStoryTelling, image_url: `${SB}/1779757424172-in1rsv.jpg`, thumbnail_url: `${SB}/1779757424172-in1rsv_thumb.jpg` },
    { title: 'CINEMÁTICO CÉU', description: 'Cena cinematográfica ultrarrealista com personagem flutuando acima das nuvens. Qualidade 4K', category_id: catStoryTelling, image_url: `${SB}/1779756852582-hg9n29.jpg`, thumbnail_url: `${SB}/1779756852582-hg9n29_thumb.jpg` },
    { title: 'CALL OF DUTY STYLE', description: 'Skin 3D estilo Call of Duty: Warzone com texturas, iluminação e shaders realistas', category_id: catAnimacoes, image_url: `${SB}/1779756897052-mc53ri.jpg`, thumbnail_url: `${SB}/1779756897052-mc53ri_thumb.jpg` },
    { title: 'UP SCALE 2', description: 'Recrie a imagem em altíssima resolução, aprimorando o realismo e os microdetalhes, mantendo o personagem perfeitamente consistente', category_id: catUpscale, image_url: `${SB}/1779757052495-j65kwp.jpg`, thumbnail_url: `${SB}/1779757052495-j65kwp_thumb.jpg` },
    { title: 'VETOR', description: 'Ícone de mascote vetorial limpo e de alto contraste, baseado na pessoa da foto de referência. Contorno externo preto marcante e preenchimentos monocromáticos planos.', category_id: null, image_url: `${SB}/1779758355557-q54xf2.jpg`, thumbnail_url: `${SB}/1779758355557-q54xf2_thumb.jpg` },
  ]

  await supabase.from('ag_references').insert(refs.map(r => ({ ...r, user_id: uid, tags: null, is_favorite: false })))

  // ============ FINANCEIRO: Junho 2026 ============
  const finData = {
    income: [
      { id: crypto.randomUUID(), description: 'VENOM', amount: 4000, category: 'Trabalho', date: '2026-06-25', notes: '', received: false, realAmount: null },
      { id: crypto.randomUUID(), description: 'ZENITH', amount: 1200, category: 'Trabalho', date: '2026-06-15', notes: '', received: false, realAmount: null },
      { id: crypto.randomUUID(), description: 'C4', amount: 2300, category: 'Imóveis', date: '2026-06-25', notes: '', received: false, realAmount: null },
      { id: crypto.randomUUID(), description: 'ALPHA', amount: 2200, category: '', date: '2026-06-10', notes: '', received: true, realAmount: 2200 },
      { id: crypto.randomUUID(), description: 'JOTAPÊ', amount: 3500, category: '', date: '2026-06-28', notes: '', received: false, realAmount: null },
      { id: crypto.randomUUID(), description: 'KARL', amount: 1000, category: '', date: '2026-06-10', notes: '', received: false, realAmount: null },
      { id: crypto.randomUUID(), description: 'PROV - EVILÂNIO', amount: 390, category: '', date: '2026-06-01', notes: '', received: true, realAmount: 390 },
      { id: crypto.randomUUID(), description: 'SITE CJE', amount: 1200, category: '', date: '2026-06-12', notes: '', received: false, realAmount: null },
      { id: crypto.randomUUID(), description: 'LOGO SINES BARBER', amount: 500, category: '', date: '2026-06-25', notes: '', received: false, realAmount: null },
      { id: crypto.randomUUID(), description: 'CURE PHARMA 1', amount: 1750, category: '', date: '2026-06-17', notes: '', received: true, realAmount: 1750 },
      { id: crypto.randomUUID(), description: 'CURE PHARMA 2', amount: 1750, category: '', date: '2026-06-30', notes: '', received: false, realAmount: null },
    ],
    expenses: [
      { id: crypto.randomUUID(), description: 'Aluguel', amount: 600, category: 'Moradia', date: '2026-06-10', notes: '', isFixed: true, paid: true },
      { id: crypto.randomUUID(), description: 'Água / Saneamento', amount: 76.36, category: 'Moradia', date: '2026-06-10', notes: 'COPASA', isFixed: true, paid: true },
      { id: crypto.randomUUID(), description: 'CONSÓRCIO', amount: 842.49, category: '', date: '2026-06-10', notes: '', isFixed: true, paid: true },
      { id: crypto.randomUUID(), description: 'Celular', amount: 69.64, category: 'Tecnologia', date: '2026-06-12', notes: '', isFixed: true, paid: true },
      { id: crypto.randomUUID(), description: 'PARCELA CAIXA', amount: 397.35, category: '', date: '2026-06-12', notes: '', isFixed: true, paid: true },
      { id: crypto.randomUUID(), description: 'Energia Elétrica', amount: 257.80, category: 'Moradia', date: '2026-06-15', notes: '', isFixed: true, paid: true },
      { id: crypto.randomUUID(), description: 'Internet', amount: 70, category: 'Moradia', date: '2026-06-15', notes: '', isFixed: true, paid: true },
      { id: crypto.randomUUID(), description: 'DARF', amount: 87, category: '', date: '2026-06-28', notes: '', isFixed: true, paid: true },
      { id: crypto.randomUUID(), description: 'CARTÕES', amount: 1000, category: '', date: '2026-06-25', notes: '', isFixed: true, paid: false },
      { id: crypto.randomUUID(), description: 'FINANCEIRO', amount: 990, category: '', date: '2026-06-29', notes: '', isFixed: true, paid: false },
      { id: crypto.randomUUID(), description: 'TG 60MG', amount: 950, category: '', date: '', notes: '', isFixed: false, paid: true },
      { id: crypto.randomUUID(), description: 'DOCUMENTOS MÃE', amount: 300, category: '', date: '', notes: '', isFixed: false, paid: true },
    ],
  }

  await supabase.from('fin_months').upsert({
    user_id: uid, year: 2026, month: 5, data: finData,
  }, { onConflict: 'user_id,year,month' })

  // ============ PROPOSTAS: Clientes ============
  const c1 = crypto.randomUUID(), c2 = crypto.randomUUID()
  await supabase.from('clients').insert([
    { id: c1, user_id: uid, name: 'ZENITH PHARMA', contact: '11921825911', email: '', type: 'pj' },
    { id: c2, user_id: uid, name: 'NANDO TIPS', contact: '11980392945', email: '', type: 'pf' },
  ])

  // ============ PROPOSTAS: Proposals ============
  await supabase.from('proposals').insert([
    { user_id: uid, client_id: c1, title: 'Estruturação', items: [{ id: crypto.randomUUID(), description: 'Estruturação de marca', quantity: 1, unit_price: 2600 }], status: 'rascunho', total: 2600 },
    { user_id: uid, client_id: c2, title: 'Proposta de Serviços de Design Gráfico Profissional', items: [{ id: crypto.randomUUID(), description: 'Design gráfico profissional', quantity: 1, unit_price: 401 }], status: 'rascunho', total: 401 },
    { user_id: uid, client_id: null, title: 'Proposta Gestão de Redes', items: [{ id: crypto.randomUUID(), description: 'Gestão de redes sociais', quantity: 1, unit_price: 2500 }], status: 'rascunho', total: 2500 },
  ])

  return NextResponse.json({ ok: true, message: 'Dados importados com sucesso!' })
}
