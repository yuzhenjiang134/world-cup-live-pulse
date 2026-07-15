import type { MatchEventType } from "../types";

export type FanStandLanguage = "en" | "zh" | "es" | "pt" | "fr" | "de" | "ja" | "ar";

export type FanStandMoment = {
  minute: number;
  eventType?: MatchEventType;
  team?: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
};

export type FanStandTake = {
  side: "home" | "neutral" | "away";
  label: string;
  text: string;
};

export type FanStandCopy = {
  kicker: string;
  title: string;
  description: string;
  allFans: string;
  teamFans: (team: string) => string;
  react: string;
  celebrate: string;
  applaud: string;
  surprised: string;
  placeholder: string;
  post: string;
  empty: string;
  saved: string;
  minute: string;
  matchUpdate: string;
  matchMoments: string;
  replayMoment: string;
  currentMoment: string;
  quickPrompt: string;
  voices: string;
  scenario: string;
  voiceRoles: [string, string, string];
  prompts: [string, string, string];
  yourPost: string;
  removePost: string;
};

const eventTitles: Record<FanStandLanguage, Record<MatchEventType, string>> = {
  en: { kickoff: "Kick-off", goal: "Goal", yellow_card: "Yellow card", red_card: "Red card", score_update: "Score update", substitution: "Substitution", odds_shift: "Momentum rising", halftime: "Half-time", fulltime: "Full-time" },
  zh: { kickoff: "比赛开始", goal: "进球", yellow_card: "黄牌", red_card: "红牌", score_update: "比分更新", substitution: "换人", odds_shift: "场面升温", halftime: "半场结束", fulltime: "全场结束" },
  es: { kickoff: "Comienza el partido", goal: "Gol", yellow_card: "Tarjeta amarilla", red_card: "Tarjeta roja", score_update: "Marcador actualizado", substitution: "Cambio", odds_shift: "Sube la intensidad", halftime: "Descanso", fulltime: "Final" },
  pt: { kickoff: "Começa o jogo", goal: "Gol", yellow_card: "Cartão amarelo", red_card: "Cartão vermelho", score_update: "Placar atualizado", substitution: "Substituição", odds_shift: "Jogo esquenta", halftime: "Intervalo", fulltime: "Fim de jogo" },
  fr: { kickoff: "Coup d'envoi", goal: "But", yellow_card: "Carton jaune", red_card: "Carton rouge", score_update: "Score actualisé", substitution: "Changement", odds_shift: "Le rythme monte", halftime: "Mi-temps", fulltime: "Terminé" },
  de: { kickoff: "Anpfiff", goal: "Tor", yellow_card: "Gelbe Karte", red_card: "Rote Karte", score_update: "Spielstand aktualisiert", substitution: "Wechsel", odds_shift: "Das Spiel wird intensiver", halftime: "Halbzeit", fulltime: "Abpfiff" },
  ja: { kickoff: "キックオフ", goal: "ゴール", yellow_card: "イエローカード", red_card: "レッドカード", score_update: "スコア更新", substitution: "選手交代", odds_shift: "試合がヒートアップ", halftime: "ハーフタイム", fulltime: "試合終了" },
  ar: { kickoff: "بداية المباراة", goal: "هدف", yellow_card: "بطاقة صفراء", red_card: "بطاقة حمراء", score_update: "تحديث النتيجة", substitution: "تبديل", odds_shift: "ارتفاع إيقاع المباراة", halftime: "نهاية الشوط الأول", fulltime: "نهاية المباراة" },
};

export function fanMomentTitle(language: FanStandLanguage, moment: FanStandMoment) {
  const title = moment.eventType ? eventTitles[language][moment.eventType] : eventTitles[language].kickoff;
  const showTeam = moment.team && ["goal", "yellow_card", "red_card", "substitution"].includes(moment.eventType ?? "");
  return `${Math.max(1, Math.round(moment.minute))}' · ${title}${showTeam ? ` · ${moment.team}` : ""}`;
}

export function fanMomentPrompts(language: FanStandLanguage, moment: FanStandMoment): [string, string, string] {
  const score = `${moment.homeScore}-${moment.awayScore}`;
  const team = moment.team ?? moment.home;
  switch (language) {
    case "zh":
      if (moment.eventType === "goal") return [`${team}进球后，你觉得比赛会怎么走？`, `${moment.home}和${moment.away}谁会掌控下一段比赛？`, "你心中的本场最佳是谁？"];
      if (moment.eventType === "yellow_card") return ["这张黄牌会影响接下来的防守吗？", "哪一边会抓住下一次定位球机会？", "你觉得这次判罚合理吗？"];
      if (moment.eventType === "red_card") return ["少打一人后应该立刻怎么调整？", "人数优势的一方该提速还是控球？", `当前${score}，比赛还会出现几个进球？`];
      if (moment.eventType === "fulltime") return ["这场比赛最关键的转折是什么？", "谁是你心中的本场最佳？", "你会给这场比赛打几分？"];
      return [`比分${score}，谁会抓住下一次机会？`, `${moment.home}还是${moment.away}踢得更主动？`, "现在你最关注哪名球员？"];
    case "es":
      if (moment.eventType === "goal") return [`¿Cómo cambia el gol de ${team} el partido?`, `¿Quién dominará ahora: ${moment.home} o ${moment.away}?`, "¿Quién es tu figura del partido?"];
      if (moment.eventType === "yellow_card") return ["¿Cambiará esta amarilla la forma de defender?", "¿Quién aprovechará la próxima pelota parada?", "¿Te pareció justa la tarjeta?"];
      if (moment.eventType === "red_card") return ["¿Cómo debe reorganizarse el equipo con diez?", "¿El rival debe acelerar o controlar?", `Con ${score}, ¿cuántos goles faltan?`];
      if (moment.eventType === "fulltime") return ["¿Cuál fue el giro decisivo?", "¿Quién fue la figura?", "¿Qué nota le das al partido?"];
      return [`Con ${score}, ¿quién tendrá la próxima ocasión?`, `¿Quién juega mejor: ${moment.home} o ${moment.away}?`, "¿A qué jugador sigues ahora?"];
    case "pt":
      if (moment.eventType === "goal") return [`Como o gol de ${team} muda o jogo?`, `Quem domina agora: ${moment.home} ou ${moment.away}?`, "Quem é o melhor em campo?"];
      if (moment.eventType === "yellow_card") return ["Esse amarelo muda a marcação?", "Quem aproveita a próxima bola parada?", "O cartão foi justo?"];
      if (moment.eventType === "red_card") return ["Como o time com dez deve se reorganizar?", "O rival acelera ou controla a posse?", `Com ${score}, quantos gols ainda vêm?`];
      if (moment.eventType === "fulltime") return ["Qual foi a virada decisiva do jogo?", "Quem foi o craque?", "Que nota você dá à partida?"];
      return [`Com ${score}, quem cria a próxima chance?`, `Quem está melhor: ${moment.home} ou ${moment.away}?`, "Qual jogador você acompanha agora?"];
    case "fr":
      if (moment.eventType === "goal") return [`Que change le but de ${team} ?`, `Qui va prendre le contrôle : ${moment.home} ou ${moment.away} ?`, "Qui est votre joueur du match ?"];
      if (moment.eventType === "yellow_card") return ["Ce jaune va-t-il changer la défense ?", "Qui profitera du prochain coup de pied arrêté ?", "Le carton vous semble-t-il juste ?"];
      if (moment.eventType === "red_card") return ["Comment se réorganiser à dix ?", "Faut-il accélérer ou garder le ballon ?", `À ${score}, combien de buts encore ?`];
      if (moment.eventType === "fulltime") return ["Quel a été le tournant du match ?", "Qui est votre joueur du match ?", "Quelle note donnez-vous au match ?"];
      return [`À ${score}, qui aura la prochaine occasion ?`, `Qui joue le mieux : ${moment.home} ou ${moment.away} ?`, "Quel joueur suivez-vous maintenant ?"];
    case "de":
      if (moment.eventType === "goal") return [`Wie verändert das Tor von ${team} das Spiel?`, `Wer übernimmt jetzt: ${moment.home} oder ${moment.away}?`, "Wer ist dein Spieler des Spiels?"];
      if (moment.eventType === "yellow_card") return ["Verändert die Gelbe Karte das Abwehrverhalten?", "Wer nutzt den nächsten Standard?", "War die Karte gerecht?"];
      if (moment.eventType === "red_card") return ["Wie stellt sich das Team in Unterzahl auf?", "Soll der Gegner beschleunigen oder kontrollieren?", `Bei ${score}: Wie viele Tore folgen noch?`];
      if (moment.eventType === "fulltime") return ["Was war der Wendepunkt?", "Wer war Spieler des Spiels?", "Welche Note gibst du dem Spiel?"];
      return [`Bei ${score}: Wer hat die nächste Chance?`, `Wer ist aktiver: ${moment.home} oder ${moment.away}?`, "Welchen Spieler beobachtest du?"];
    case "ja":
      if (moment.eventType === "goal") return [`${team}のゴールで試合はどう変わる？`, `次に主導権を握るのは${moment.home}か${moment.away}か？`, "あなたのマン・オブ・ザ・マッチは？"];
      if (moment.eventType === "yellow_card") return ["このカードで守り方は変わる？", "次のセットプレーを生かすのはどちら？", "この判定は妥当だった？"];
      if (moment.eventType === "red_card") return ["10人になったチームはどう立て直す？", "数的優位側は攻めるべき？それとも保持？", `現在${score}、あと何点入る？`];
      if (moment.eventType === "fulltime") return ["最大のターニングポイントは？", "今日のMVPは？", "この試合に何点をつける？"];
      return [`現在${score}、次のチャンスを作るのは？`, `${moment.home}と${moment.away}、どちらが優勢？`, "今注目している選手は？"];
    case "ar":
      if (moment.eventType === "goal") return [`كيف غيّر هدف ${team} المباراة؟`, `من سيسيطر الآن: ${moment.home} أم ${moment.away}؟`, "من هو نجم المباراة بالنسبة لك؟"];
      if (moment.eventType === "yellow_card") return ["هل ستغير البطاقة أسلوب الدفاع؟", "من سيستفيد من الكرة الثابتة التالية؟", "هل كان القرار عادلاً؟"];
      if (moment.eventType === "red_card") return ["كيف يعيد الفريق تنظيمه بعشرة لاعبين؟", "هل يسرّع المنافس اللعب أم يحتفظ بالكرة؟", `النتيجة ${score}، كم هدفاً سيأتي؟`];
      if (moment.eventType === "fulltime") return ["ما اللحظة التي حسمت المباراة؟", "من هو نجم المباراة؟", "كيف تقيّم المباراة؟"];
      return [`النتيجة ${score}، من يصنع الفرصة التالية؟`, `من يلعب أفضل: ${moment.home} أم ${moment.away}؟`, "أي لاعب تتابع الآن؟"];
    default:
      if (moment.eventType === "goal") return [`How does ${team}'s goal change the match?`, `Who controls the next spell: ${moment.home} or ${moment.away}?`, "Who is your player of the match?"];
      if (moment.eventType === "yellow_card") return ["Will this booking change the defending?", "Who takes the next set-piece chance?", "Did the card look fair to you?"];
      if (moment.eventType === "red_card") return ["How should the ten-player side reorganize?", "Should the extra player be used to press or control?", `At ${score}, how many goals are still coming?`];
      if (moment.eventType === "fulltime") return ["What was the match's decisive turn?", "Who was your player of the match?", "How would you rate the game?"];
      return [`At ${score}, who creates the next chance?`, `Who looks stronger: ${moment.home} or ${moment.away}?`, "Which player are you watching now?"];
  }
}

function perspectiveTexts(language: FanStandLanguage, moment: FanStandMoment): [string, string, string] {
  const score = `${moment.homeScore}-${moment.awayScore}`;
  switch (language) {
    case "zh":
      if (!moment.eventType) return ["期待主队从开场就把节奏提起来。", "先看双方阵型和中场对抗，开局会透露很多。", "客队如果先稳住前十五分钟，机会就会出来。"];
      if (moment.eventType === "goal") return ["这次前插终于打穿了防线，继续把节奏压上去！", "这粒进球来自连续施压，接下来要看落后一方怎么回应。", "先稳住阵型，下一次防守不能再给同样的空间。"];
      if (moment.eventType === "yellow_card") return ["后面的对抗得更聪明，别再轻易给裁判机会。", "这张牌会改变防守强度，下一次一对一更值得看。", "可以多冲击吃牌这一侧，把压力持续做出来。"];
      if (moment.eventType === "red_card") return ["少打一人也不能乱，先把中路和禁区前沿守住。", `当前${score}，人数变化会让后面的空间完全不同。`, "人数占优也要耐心，别把机会浪费在仓促远射上。"];
      if (moment.eventType === "fulltime") return ["结果已经定了，最值得记住的是球队没有放弃最后一段。", `最终比分${score}，比赛的转折点比数字更值得回看。`, "这场结束了，下一场最需要改善的是机会把握。"];
      return ["比分没有变化，先把球权和节奏拿稳。", `目前${score}，下一次真正有威胁的进攻会很关键。`, "比赛还在拉扯，谁先连续赢下对抗谁就占上风。"];
    case "es":
      if (!moment.eventType) return ["Quiero ver al equipo local imponer el ritmo desde el inicio.", "La forma de ambos equipos y la batalla del medio dirán mucho pronto.", "Si el visitante supera los primeros quince minutos, aparecerán sus opciones."];
      if (moment.eventType === "goal") return ["¡La llegada rompió la línea; hay que mantener la presión!", "El gol premia una fase de presión continua; ahora importa la respuesta.", "Calma y orden: no se puede conceder el mismo espacio otra vez."];
      if (moment.eventType === "yellow_card") return ["Toca defender con cabeza y no regalar otra falta.", "La tarjeta cambia el próximo duelo uno contra uno.", "Hay que atacar ese costado y obligar al defensor a decidir."];
      if (moment.eventType === "red_card") return ["Con diez, primero hay que cerrar el centro.", `Con ${score}, la superioridad cambia todos los espacios.`, "Con uno más hace falta paciencia, no tiros apresurados."];
      if (moment.eventType === "fulltime") return ["El resultado está cerrado; queda el esfuerzo hasta el final.", `El ${score} cuenta, pero el giro del partido explica más.`, "El próximo paso es aprovechar mejor las ocasiones."];
      return ["El marcador no cambia; primero hay que recuperar el control.", `Con ${score}, la próxima ocasión clara será enorme.`, "El equipo que gane dos duelos seguidos tomará la iniciativa."];
    case "pt":
      if (!moment.eventType) return ["Quero ver o time da casa acelerar desde o começo.", "A organização e a disputa no meio vão mostrar muito logo cedo.", "Se o visitante passar bem pelos primeiros quinze minutos, terá suas chances."];
      if (moment.eventType === "goal") return ["A infiltração abriu a defesa; é hora de manter a pressão!", "O gol veio de uma sequência forte; agora vale observar a resposta.", "Calma e organização para não ceder o mesmo espaço outra vez."];
      if (moment.eventType === "yellow_card") return ["Agora é defender com inteligência e evitar outra falta.", "O cartão muda o próximo duelo individual.", "Vale atacar esse lado e testar o defensor amarelado."];
      if (moment.eventType === "red_card") return ["Com dez, o primeiro passo é fechar o meio.", `Com ${score}, a vantagem numérica muda os espaços.`, "Com um a mais, é melhor ter paciência do que chutar cedo."];
      if (moment.eventType === "fulltime") return ["O resultado está fechado; fica a entrega até o fim.", `O ${score} conta, mas o ponto de virada explica mais.`, "No próximo jogo, é preciso aproveitar melhor as chances."];
      return ["O placar segue igual; primeiro é preciso controlar a bola.", `Com ${score}, a próxima chance clara pode decidir.`, "Quem vencer os próximos duelos vai assumir o jogo."];
    case "fr":
      if (!moment.eventType) return ["J'attends que l'équipe à domicile impose son rythme dès le départ.", "La mise en place et le duel au milieu donneront vite le ton.", "Si les visiteurs tiennent le premier quart d'heure, leurs occasions viendront."];
      if (moment.eventType === "goal") return ["L'appel a enfin cassé la ligne, il faut continuer à pousser !", "Le but récompense une séquence de pression; la réponse va compter.", "Il faut retrouver du calme et ne plus offrir le même espace."];
      if (moment.eventType === "yellow_card") return ["Il faut défendre plus intelligemment et éviter une nouvelle faute.", "Ce carton change le prochain duel en un contre un.", "Il faut insister de ce côté et tester le défenseur averti."];
      if (moment.eventType === "red_card") return ["À dix, la priorité est de fermer l'axe.", `À ${score}, l'avantage numérique change tous les espaces.`, "À onze contre dix, patience avant tout."];
      if (moment.eventType === "fulltime") return ["Le résultat est acquis, mais l'effort jusqu'au bout reste à retenir.", `Le ${score} compte; le tournant raconte encore mieux le match.`, "Au prochain match, il faudra mieux finir les occasions."];
      return ["Le score ne bouge pas; il faut reprendre le contrôle.", `À ${score}, la prochaine occasion nette pèsera lourd.`, "Celui qui gagne les prochains duels prendra l'initiative."];
    case "de":
      if (!moment.eventType) return ["Die Heimmannschaft soll von Beginn an Tempo machen.", "Ordnung und Mittelfeldduelle werden früh viel verraten.", "Übersteht das Auswärtsteam die ersten 15 Minuten, kommen seine Chancen."];
      if (moment.eventType === "goal") return ["Der Laufweg hat die Linie geknackt; jetzt weiter Druck machen!", "Das Tor belohnt die Druckphase; jetzt zählt die Reaktion.", "Ruhe bewahren und denselben Raum nicht noch einmal öffnen."];
      if (moment.eventType === "yellow_card") return ["Jetzt clever verteidigen und kein weiteres Foul schenken.", "Die Karte verändert das nächste Eins-gegen-eins.", "Diese Seite sollte jetzt gezielt angegriffen werden."];
      if (moment.eventType === "red_card") return ["In Unterzahl muss zuerst das Zentrum geschlossen werden.", `Bei ${score} verändert die Überzahl jeden freien Raum.`, "Mit einem Mann mehr ist Geduld wichtiger als frühe Abschlüsse."];
      if (moment.eventType === "fulltime") return ["Das Ergebnis steht; der Einsatz bis zum Ende bleibt hängen.", `Das ${score} zählt, doch der Wendepunkt erzählt mehr.`, "Im nächsten Spiel müssen die Chancen besser genutzt werden."];
      return ["Der Spielstand bleibt; jetzt braucht es Ballkontrolle.", `Bei ${score} kann die nächste klare Chance entscheiden.`, "Wer die nächsten Duelle gewinnt, übernimmt das Spiel."];
    case "ja":
      if (!moment.eventType) return ["ホーム側には序盤からテンポを上げてほしいです。", "両チームの配置と中盤の攻防が試合の流れを示しそうです。", "アウェー側が最初の15分を耐えれば、チャンスが生まれます。"];
      if (moment.eventType === "goal") return ["飛び出しが最終ラインを破った。このまま圧力をかけたい！", "連続した圧力が得点につながった。次は相手の反応に注目。", "まず形を整え、同じスペースを二度与えないこと。"];
      if (moment.eventType === "yellow_card") return ["次の守備はもっと賢く、余計なファウルを避けたい。", "このカードで次の1対1の意味が変わる。", "警告を受けた側を狙ってプレッシャーをかけたい。"];
      if (moment.eventType === "red_card") return ["10人なら、まず中央を閉じて形を崩さないこと。", `現在${score}、数的差で使えるスペースが変わる。`, "数的優位でも焦らず、良い形まで待ちたい。"];
      if (moment.eventType === "fulltime") return ["結果は決まったが、最後まで戦った姿勢は残る。", `最終スコアは${score}。数字以上に転機を見返したい。`, "次戦では決定機をもっと確実に仕留めたい。"];
      return ["スコアは動かない。まずボールとテンポを握りたい。", `現在${score}、次の決定機が大きな意味を持つ。`, "次の連続したデュエルを制した側が流れをつかむ。"];
    case "ar":
      if (!moment.eventType) return ["أتوقع أن يرفع صاحب الأرض الإيقاع منذ البداية.", "شكل الفريقين وصراع الوسط سيكشفان الكثير مبكرا.", "إذا صمد الضيف أول 15 دقيقة فستأتي فرصه."];
      if (moment.eventType === "goal") return ["الانطلاق كسر الخط الدفاعي؛ يجب مواصلة الضغط!", "الهدف جاء بعد ضغط متواصل؛ الآن ننتظر الرد.", "الهدوء والتنظيم حتى لا يتكرر الفراغ نفسه."];
      if (moment.eventType === "yellow_card") return ["يجب الدفاع بذكاء وتجنب خطأ جديد.", "البطاقة ستغير المواجهة الفردية التالية.", "من الأفضل الضغط على هذا الجانب واختبار المدافع."];
      if (moment.eventType === "red_card") return ["بعشرة لاعبين يجب إغلاق العمق أولاً.", `عند ${score} يغير التفوق العددي كل المساحات.`, "مع لاعب إضافي، الصبر أفضل من التسديد المتسرع."];
      if (moment.eventType === "fulltime") return ["حُسمت النتيجة، ويبقى القتال حتى النهاية.", `النتيجة ${score}، لكن لحظة التحول تروي المباراة أكثر.`, "في المباراة المقبلة يجب استغلال الفرص بشكل أفضل."];
      return ["النتيجة ثابتة؛ الأولوية لاستعادة السيطرة.", `عند ${score} قد تكون الفرصة الواضحة التالية حاسمة.`, "من يفوز بالمواجهات التالية سيفرض إيقاعه."];
    default:
      if (!moment.eventType) return ["I want the home side to set the tempo from kickoff.", "The shapes and midfield duels will tell us plenty early on.", "If the away side settles through the first 15 minutes, chances will come."];
      if (moment.eventType === "goal") return ["That run finally broke the line. Keep the pressure on!", "The goal rewards a strong spell; the response matters now.", "Reset the shape and do not allow the same space again."];
      if (moment.eventType === "yellow_card") return ["Defend smarter now and avoid giving the referee another decision.", "The booking changes the next one-on-one duel.", "Attack that side and make the booked defender choose."];
      if (moment.eventType === "red_card") return ["With ten, close the middle before chasing the ball.", `At ${score}, the extra player changes every pocket of space.`, "Use the advantage patiently instead of forcing early shots."];
      if (moment.eventType === "fulltime") return ["The result is set; the fight through the final stretch still matters.", `The ${score} matters, but the turning point tells the fuller story.`, "The next step is turning more chances into goals."];
      return ["The score is unchanged. Take back the ball and the tempo.", `At ${score}, the next clear chance could be decisive.`, "The side that wins the next few duels will take control."];
  }
}

export function fanMomentTakes(language: FanStandLanguage, moment: FanStandMoment): [FanStandTake, FanStandTake, FanStandTake] {
  const roles = fanStandCopy[language].voiceRoles;
  const texts = perspectiveTexts(language, moment);
  return [
    { side: "home", label: roles[0], text: texts[0] },
    { side: "neutral", label: roles[1], text: texts[1] },
    { side: "away", label: roles[2], text: texts[2] },
  ];
}

export const fanStandCopy: Record<FanStandLanguage, FanStandCopy> = {
  en: {
    kicker: "Fan interaction",
    title: "Match channel",
    description: "Follow the key moments, join the conversation, and keep your own match memories.",
    allFans: "All fans",
    teamFans: (team) => `${team} fans`,
    react: "Your reaction",
    celebrate: "Celebrate",
    applaud: "Applaud",
    surprised: "Surprised",
    placeholder: "Share your take on the match",
    post: "Post",
    empty: "No notes from you in this room yet. Pick a topic or say who you support.",
    saved: "Your reactions and notes stay on this device.",
    minute: "Match minute",
    matchUpdate: "Match focus",
    matchMoments: "Key moments",
    replayMoment: "Replay this moment",
    currentMoment: "Now",
    quickPrompt: "Talk about the match",
    voices: "What fans are debating",
    scenario: "Discussion starters",
    voiceRoles: ["Home end", "Neutral view", "Away end"],
    prompts: ["Who scores next?", "Which player are you watching?", "Your full-time score?"],
    yourPost: "You",
    removePost: "Remove your post",
  },
  zh: {
    kicker: "球迷互动",
    title: "比赛频道",
    description: "跟住关键时刻，加入比赛讨论，留下自己的观赛记忆。",
    allFans: "全部球迷",
    teamFans: (team) => `${team}球迷`,
    react: "我的反应",
    celebrate: "庆祝",
    applaud: "鼓掌",
    surprised: "意外",
    placeholder: "说说你对这场比赛的看法",
    post: "发布",
    empty: "这里还没有你的留言。选一个话题，或者直接说说你支持谁。",
    saved: "你的反应和留言只保存在这台设备。",
    minute: "比赛分钟",
    matchUpdate: "本场焦点",
    matchMoments: "关键时刻",
    replayMoment: "回看这个时刻",
    currentMoment: "当前",
    quickPrompt: "聊聊这场",
    voices: "球迷正在聊",
    scenario: "讨论话题",
    voiceRoles: ["主队看台", "中立视角", "客队看台"],
    prompts: ["你看好谁下一个进球？", "你最关注哪名球员？", "你觉得最终比分是多少？"],
    yourPost: "我",
    removePost: "删除我的评论",
  },
  es: {
    kicker: "Interacción de fans",
    title: "Canal del partido",
    description: "Sigue los momentos clave, únete a la conversación y guarda tus recuerdos.",
    allFans: "Todos",
    teamFans: (team) => `Fans de ${team}`,
    react: "Tu reacción",
    celebrate: "Celebrar",
    applaud: "Aplaudir",
    surprised: "Sorpresa",
    placeholder: "¿Qué te pareció este momento?",
    post: "Publicar",
    empty: "Aún no has dejado una nota aquí. Elige un tema o di a quién apoyas.",
    saved: "Tus reacciones y notas quedan en este dispositivo.",
    minute: "Minuto",
    matchUpdate: "Foco del partido",
    matchMoments: "Momentos clave",
    replayMoment: "Repetir este momento",
    currentMoment: "Ahora",
    quickPrompt: "Habla del partido",
    voices: "Lo que debate la afición",
    scenario: "Temas para conversar",
    voiceRoles: ["Grada local", "Visión neutral", "Grada visitante"],
    prompts: ["¿Quién marca después?", "¿A qué jugador sigues?", "¿Tu marcador final?"],
    yourPost: "Tú",
    removePost: "Eliminar tu comentario",
  },
  pt: {
    kicker: "Interação da torcida",
    title: "Canal da partida",
    description: "Acompanhe os momentos-chave, participe da conversa e guarde suas memórias.",
    allFans: "Todos",
    teamFans: (team) => `Torcida de ${team}`,
    react: "Sua reação",
    celebrate: "Comemorar",
    applaud: "Aplaudir",
    surprised: "Surpresa",
    placeholder: "O que você achou deste momento?",
    post: "Publicar",
    empty: "Você ainda não deixou uma nota aqui. Escolha um tema ou diga para quem torce.",
    saved: "Suas reações e notas ficam neste dispositivo.",
    minute: "Minuto",
    matchUpdate: "Destaque do jogo",
    matchMoments: "Momentos-chave",
    replayMoment: "Rever este momento",
    currentMoment: "Agora",
    quickPrompt: "Fale sobre o jogo",
    voices: "O que a torcida debate",
    scenario: "Pontos para conversar",
    voiceRoles: ["Torcida da casa", "Visão neutra", "Torcida visitante"],
    prompts: ["Quem marca o próximo?", "Qual jogador você acompanha?", "Qual será o placar final?"],
    yourPost: "Você",
    removePost: "Remover seu comentário",
  },
  fr: {
    kicker: "Interaction des fans",
    title: "Canal du match",
    description: "Suivez les temps forts, rejoignez la discussion et gardez vos souvenirs.",
    allFans: "Tous les fans",
    teamFans: (team) => `Fans de ${team}`,
    react: "Votre réaction",
    celebrate: "Célébrer",
    applaud: "Applaudir",
    surprised: "Surpris",
    placeholder: "Que pensez-vous de ce moment ?",
    post: "Publier",
    empty: "Vous n'avez encore rien écrit ici. Choisissez un sujet ou dites qui vous soutenez.",
    saved: "Vos réactions et messages restent sur cet appareil.",
    minute: "Minute",
    matchUpdate: "Temps fort",
    matchMoments: "Temps forts",
    replayMoment: "Revoir ce moment",
    currentMoment: "Maintenant",
    quickPrompt: "Parler du match",
    voices: "Ce que les fans débattent",
    scenario: "Sujets de discussion",
    voiceRoles: ["Tribune locale", "Regard neutre", "Tribune visiteuse"],
    prompts: ["Qui marquera ensuite ?", "Quel joueur suivez-vous ?", "Votre score final ?"],
    yourPost: "Vous",
    removePost: "Supprimer votre message",
  },
  de: {
    kicker: "Fan-Interaktion",
    title: "Spielkanal",
    description: "Verfolge Schlüsselmomente, diskutiere mit und halte deine Erinnerungen fest.",
    allFans: "Alle Fans",
    teamFans: (team) => `${team}-Fans`,
    react: "Deine Reaktion",
    celebrate: "Feiern",
    applaud: "Applaus",
    surprised: "Überrascht",
    placeholder: "Was hältst du von diesem Moment?",
    post: "Posten",
    empty: "Du hast hier noch nichts notiert. Wähle ein Thema oder sag, wen du unterstützt.",
    saved: "Deine Reaktionen und Beiträge bleiben auf diesem Gerät.",
    minute: "Spielminute",
    matchUpdate: "Spiel im Fokus",
    matchMoments: "Schlüsselmomente",
    replayMoment: "Diesen Moment ansehen",
    currentMoment: "Jetzt",
    quickPrompt: "Über das Spiel reden",
    voices: "Was die Fans diskutieren",
    scenario: "Gesprächsimpulse",
    voiceRoles: ["Heimkurve", "Neutrale Sicht", "Gästeblock"],
    prompts: ["Wer trifft als Nächstes?", "Welchen Spieler beobachtest du?", "Dein Endstand?"],
    yourPost: "Du",
    removePost: "Eigenen Beitrag entfernen",
  },
  ja: {
    kicker: "ファン交流",
    title: "マッチチャンネル",
    description: "重要な場面を追い、会話に参加し、自分の観戦記録を残せます。",
    allFans: "すべてのファン",
    teamFans: (team) => `${team} ファン`,
    react: "あなたの反応",
    celebrate: "喜ぶ",
    applaud: "拍手",
    surprised: "驚き",
    placeholder: "この場面をどう見ましたか？",
    post: "投稿",
    empty: "まだあなたのメモはありません。話題を選ぶか、応援するチームを書いてみましょう。",
    saved: "リアクションと投稿はこの端末だけに保存されます。",
    minute: "試合時間",
    matchUpdate: "この試合の注目点",
    matchMoments: "重要な場面",
    replayMoment: "この場面を再生",
    currentMoment: "現在",
    quickPrompt: "試合について話す",
    voices: "ファンの注目点",
    scenario: "会話のきっかけ",
    voiceRoles: ["ホーム側", "中立の視点", "アウェイ側"],
    prompts: ["次に得点するのは？", "注目している選手は？", "最終スコア予想は？"],
    yourPost: "あなた",
    removePost: "自分の投稿を削除",
  },
  ar: {
    kicker: "تفاعل المشجعين",
    title: "قناة المباراة",
    description: "تابع اللحظات المهمة وشارك في النقاش واحتفظ بذكرياتك.",
    allFans: "كل المشجعين",
    teamFans: (team) => `مشجعو ${team}`,
    react: "تفاعلك",
    celebrate: "احتفال",
    applaud: "تصفيق",
    surprised: "مفاجأة",
    placeholder: "ما رأيك في هذه اللحظة؟",
    post: "نشر",
    empty: "لم تكتب ملاحظة هنا بعد. اختر موضوعاً أو اكتب من تشجع.",
    saved: "تبقى تفاعلاتك وملاحظاتك محفوظة على هذا الجهاز.",
    minute: "دقيقة المباراة",
    matchUpdate: "محور المباراة",
    matchMoments: "اللحظات المهمة",
    replayMoment: "إعادة هذه اللحظة",
    currentMoment: "الآن",
    quickPrompt: "تحدث عن المباراة",
    voices: "ما يناقشه المشجعون",
    scenario: "بدايات للنقاش",
    voiceRoles: ["جمهور صاحب الأرض", "رؤية محايدة", "جمهور الضيف"],
    prompts: ["من سيسجل تالياً؟", "أي لاعب تتابع؟", "ما توقعك للنتيجة النهائية؟"],
    yourPost: "أنت",
    removePost: "حذف تعليقك",
  },
};
