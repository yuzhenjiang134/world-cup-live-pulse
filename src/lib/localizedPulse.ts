import type { MatchData, MatchEvent, PulseFrame } from "../types";

export type PulseLanguage = "en" | "zh" | "es" | "pt" | "fr" | "de" | "ja" | "ar";

export function localizeCommentary(language: PulseLanguage, match: MatchData, frame: PulseFrame) {
  const event = frame.latestEvent;
  const player = event?.player ?? teamLabel(language, event?.team) ?? "the scorer";
  const score = `${frame.homeScore}-${frame.awayScore}`;

  if (!event) return language === "en" ? frame.commentary : localizedWaiting(language, match);

  if (event.type === "goal") {
    if (language === "zh") return `${player}在${frame.minute}分钟改变了比赛走势，当前比分为 ${score}。`;
    if (language === "es") return `${player} cambia el partido en el minuto ${frame.minute}; el marcador es ${score}.`;
    if (language === "pt") return `${player} muda a partida aos ${frame.minute} minutos; o placar está ${score}.`;
    if (language === "fr") return `${player} change le match à la ${frame.minute}e minute; le score est ${score}.`;
    if (language === "de") return `${player} verändert das Spiel in Minute ${frame.minute}; der Stand ist ${score}.`;
    if (language === "ja") return `${player}が${frame.minute}分に試合の流れを変えました。スコアは ${score} です。`;
    if (language === "ar") return `${player} يغيّر مجرى المباراة في الدقيقة ${frame.minute}؛ النتيجة ${score}.`;
  }

  if (event.type === "odds_shift") {
    if (language === "zh") return `市场情绪为 ${frame.market.sentiment}/100，球迷氛围正在变化，但这不是下注建议。`;
    if (language === "es") return `El pulso del mercado está en ${frame.market.sentiment}/100; cambia el ambiente, no es consejo de apuesta.`;
    if (language === "pt") return `O pulso do mercado está em ${frame.market.sentiment}/100; o ambiente muda, sem recomendação de aposta.`;
    if (language === "fr") return `Le pouls du marché est à ${frame.market.sentiment}/100; l'ambiance évolue, sans conseil de pari.`;
    if (language === "de") return `Der Marktimpuls liegt bei ${frame.market.sentiment}/100; die Stimmung ändert sich, ohne Wettempfehlung.`;
    if (language === "ja") return `市場の脈動は ${frame.market.sentiment}/100。雰囲気の変化を示すだけで、賭けの助言ではありません。`;
    if (language === "ar") return `نبض السوق عند ${frame.market.sentiment}/100؛ هذا يصف تغير الأجواء وليس نصيحة مراهنة.`;
  }

  if (event.type === "halftime") {
    if (language === "zh") return `半场快照：${match.home.code} ${score} ${match.away.code}，下半场将决定比赛走势。`;
    if (language === "es") return `Descanso: ${match.home.code} ${score} ${match.away.code}; la segunda parte definirá el rumbo.`;
    if (language === "pt") return `Intervalo: ${match.home.code} ${score} ${match.away.code}; o segundo tempo define o rumo.`;
    if (language === "fr") return `Mi-temps : ${match.home.code} ${score} ${match.away.code}; la seconde période décidera du rythme.`;
    if (language === "de") return `Halbzeit: ${match.home.code} ${score} ${match.away.code}; die zweite Hälfte entscheidet den Rhythmus.`;
    if (language === "ja") return `ハーフタイム: ${match.home.code} ${score} ${match.away.code}。後半が流れを決めます。`;
    if (language === "ar") return `نهاية الشوط الأول: ${match.home.code} ${score} ${match.away.code}؛ الشوط الثاني سيحدد الإيقاع.`;
  }

  if (event.type === "fulltime") {
    if (language === "zh") return `全场结束：比分、事件和比赛脉冲已完成核验，本场仅用于球迷互动。`;
    if (language === "es") return `Final: marcador, eventos y pulso verificados; esta experiencia es solo para fans.`;
    if (language === "pt") return `Final: placar, eventos e pulso verificados; esta experiência é apenas para torcedores.`;
    if (language === "fr") return `Fin du match : score, événements et pouls vérifiés; expérience réservée aux fans.`;
    if (language === "de") return `Abpfiff: Stand, Ereignisse und Puls sind verifiziert; nur für Fan-Interaktion.`;
    if (language === "ja") return `試合終了: スコア、イベント、脈動を確認しました。ファン向けの体験です。`;
    if (language === "ar") return `النهاية: تم التحقق من النتيجة والأحداث والنبض؛ التجربة للمشجعين فقط.`;
  }

  return localizeEventDescription(language, event);
}

export function localizeInsight(language: PulseLanguage, match: MatchData, frame: PulseFrame) {
  const event = frame.latestEvent;
  const leader = frame.homeScore > frame.awayScore ? match.home.name : match.away.name;
  if (language === "en") return frame.insight.headline;
  if (language === "zh") {
    if (!event) return "比赛等待第一个有效节点。";
    if (event.type === "goal" && frame.homeScore !== frame.awayScore) return `${leader}暂时掌握比赛情绪中心。`;
    if (event.type === "goal") return "比分暂平，球迷情绪重新洗牌。";
    if (event.type === "halftime") return "半场形成清晰的前后对照。";
    if (event.type === "fulltime") return "回放已完成，可作为完整的球迷故事查看。";
    return "比赛脉冲正在变化，继续查看已核验事件。";
  }
  if (language === "es") return event?.type === "goal" ? `La energía cambia y ${leader} marca el tono.` : "El pulso cambia; sigue los eventos verificados.";
  if (language === "pt") return event?.type === "goal" ? `A energia muda e ${leader} dita o ritmo.` : "O pulso muda; acompanhe os eventos verificados.";
  if (language === "fr") return event?.type === "goal" ? `L'énergie change et ${leader} prend le centre du match.` : "Le pouls évolue; suivez les événements vérifiés.";
  if (language === "de") return event?.type === "goal" ? `Die Energie kippt, ${leader} bestimmt den Spielmittelpunkt.` : "Der Puls verändert sich; folge den verifizierten Ereignissen.";
  if (language === "ja") return event?.type === "goal" ? `流れが変わり、${leader}が試合の中心を握ります。` : "脈動が変化しています。検証済みイベントを確認してください。";
  return event?.type === "goal" ? `تتغير الطاقة و${leader} يسيطر على مركز المباراة.` : "يتغير النبض؛ تابع الأحداث الموثقة.";
}

export function localizeEventDescription(language: PulseLanguage, event: MatchEvent) {
  const player = event.player ?? localizedPlayer(language);
  const score = `${event.homeScore}-${event.awayScore}`;
  if (language === "en") return event.description;
  if (language === "zh") {
    if (event.type === "goal") return `${player}完成进球，比分更新为 ${score}。`;
    if (event.type === "yellow_card") return `${player}被出示黄牌，纪律信息已记录。`;
    if (event.type === "red_card") return `${player}被出示红牌，比赛人数发生变化。`;
    if (event.type === "substitution") return `${player}参与换人，比赛节奏可能变化。`;
    if (event.type === "halftime") return `半场结束，当前比分 ${score}。`;
    if (event.type === "fulltime") return `全场结束，最终比分 ${score}。`;
    if (event.type === "odds_shift") return "市场情绪快照发生变化，仅作球迷语境展示。";
    return "已核验比赛节点。";
  }
  return localizedEventByLanguage(language, event, player, score);
}

function localizedPlayer(language: PulseLanguage) {
  if (language === "zh") return "球员";
  if (language === "es") return "Jugador";
  if (language === "pt") return "Jogador";
  if (language === "fr") return "Joueur";
  if (language === "de") return "Spieler";
  if (language === "ja") return "選手";
  if (language === "ar") return "اللاعب";
  return "Player";
}

function localizedEventByLanguage(language: PulseLanguage, event: MatchEvent, player: string, score: string) {
  if (language === "es") {
    if (event.type === "goal") return `${player} marca; el marcador pasa a ${score}.`;
    if (event.type === "yellow_card") return `${player} recibe tarjeta amarilla; queda registrado.`;
    if (event.type === "red_card") return `${player} recibe tarjeta roja; cambia el número de jugadores.`;
    if (event.type === "substitution") return `${player} participa en un cambio; el ritmo puede variar.`;
    if (event.type === "halftime") return `Descanso; el marcador es ${score}.`;
    if (event.type === "fulltime") return `Final; el marcador verificado es ${score}.`;
    if (event.type === "odds_shift") return "Cambia el pulso del mercado; no es consejo de apuesta.";
    return "Evento verificado.";
  }
  if (language === "pt") {
    if (event.type === "goal") return `${player} marca; o placar fica ${score}.`;
    if (event.type === "yellow_card") return `${player} recebe cartão amarelo; o registro foi atualizado.`;
    if (event.type === "red_card") return `${player} recebe cartão vermelho; o número de jogadores muda.`;
    if (event.type === "substitution") return `${player} participa de uma substituição; o ritmo pode mudar.`;
    if (event.type === "halftime") return `Intervalo; o placar está ${score}.`;
    if (event.type === "fulltime") return `Final; o placar verificado é ${score}.`;
    if (event.type === "odds_shift") return "O pulso do mercado mudou; não é recomendação de aposta.";
    return "Evento verificado.";
  }
  if (language === "fr") {
    if (event.type === "goal") return `${player} marque; le score passe à ${score}.`;
    if (event.type === "yellow_card") return `${player} reçoit un carton jaune; l'événement est enregistré.`;
    if (event.type === "red_card") return `${player} reçoit un carton rouge; le nombre de joueurs change.`;
    if (event.type === "substitution") return `${player} participe à un remplacement; le rythme peut évoluer.`;
    if (event.type === "halftime") return `Mi-temps; le score est ${score}.`;
    if (event.type === "fulltime") return `Fin du match; le score vérifié est ${score}.`;
    if (event.type === "odds_shift") return "Le pouls du marché évolue; ce n'est pas un conseil de pari.";
    return "Événement vérifié.";
  }
  if (language === "de") {
    if (event.type === "goal") return `${player} trifft; der Stand ist ${score}.`;
    if (event.type === "yellow_card") return `${player} sieht Gelb; das Ereignis ist erfasst.`;
    if (event.type === "red_card") return `${player} sieht Rot; die Spielerzahl verändert sich.`;
    if (event.type === "substitution") return `${player} ist an einem Wechsel beteiligt; das Tempo kann sich ändern.`;
    if (event.type === "halftime") return `Halbzeit; der Stand ist ${score}.`;
    if (event.type === "fulltime") return `Abpfiff; der verifizierte Stand ist ${score}.`;
    if (event.type === "odds_shift") return "Der Marktimpuls verändert sich; keine Wettempfehlung.";
    return "Verifiziertes Ereignis.";
  }
  if (language === "ja") {
    if (event.type === "goal") return `${player}が得点し、スコアは ${score} になりました。`;
    if (event.type === "yellow_card") return `${player}にイエローカード。記録を更新しました。`;
    if (event.type === "red_card") return `${player}にレッドカード。出場人数が変わります。`;
    if (event.type === "substitution") return `${player}が交代に関与。試合のテンポが変わる可能性があります。`;
    if (event.type === "halftime") return `ハーフタイム。スコアは ${score} です。`;
    if (event.type === "fulltime") return `試合終了。確認済みスコアは ${score} です。`;
    if (event.type === "odds_shift") return "市場の脈動が変化しました。賭けの助言ではありません。";
    return "確認済みイベント。";
  }
  if (event.type === "goal") return `${player} يسجل؛ النتيجة ${score}.`;
  if (event.type === "yellow_card") return `${player} يتلقى بطاقة صفراء؛ تم تسجيل الحدث.`;
  if (event.type === "red_card") return `${player} يتلقى بطاقة حمراء؛ يتغير عدد اللاعبين.`;
  if (event.type === "substitution") return `${player} يشارك في تبديل؛ قد يتغير إيقاع المباراة.`;
  if (event.type === "halftime") return `نهاية الشوط الأول؛ النتيجة ${score}.`;
  if (event.type === "fulltime") return `النهاية؛ النتيجة الموثقة ${score}.`;
  if (event.type === "odds_shift") return "تغير نبض السوق؛ ليست نصيحة مراهنة.";
  return "حدث موثق.";
}

function localizedWaiting(language: PulseLanguage, match: MatchData) {
  if (language === "zh") return `${match.home.name} vs ${match.away.name} 正等待开赛，暂无已核验比赛事件。`;
  if (language === "es") return `${match.home.name} vs ${match.away.name} espera el inicio; aún no hay eventos verificados.`;
  if (language === "pt") return `${match.home.name} vs ${match.away.name} aguarda o início; ainda não há eventos verificados.`;
  if (language === "fr") return `${match.home.name} vs ${match.away.name} attend le coup d'envoi; aucun événement vérifié.`;
  if (language === "de") return `${match.home.name} vs ${match.away.name} wartet auf den Anpfiff; noch keine verifizierten Ereignisse.`;
  if (language === "ja") return `${match.home.name} vs ${match.away.name}はキックオフ待ちです。検証済みイベントはありません。`;
  if (language === "ar") return `${match.home.name} ضد ${match.away.name} بانتظار البداية؛ لا توجد أحداث موثقة بعد.`;
  return `${match.home.name} and ${match.away.name} are warming up the pulse before kickoff.`;
}

function teamLabel(language: PulseLanguage, code?: string) {
  if (!code) return undefined;
  if (language === "zh") return code === "HOME" ? "主队" : code === "AWAY" ? "客队" : code;
  return code;
}
