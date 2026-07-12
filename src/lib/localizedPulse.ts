import type { MatchData, MatchEvent, PulseFrame } from "../types";
import { localizeTeamName } from "../data/teamNames";

export type PulseLanguage = "en" | "zh" | "es" | "pt" | "fr" | "de" | "ja" | "ar";

export function localizeCommentary(language: PulseLanguage, match: MatchData, frame: PulseFrame) {
  const event = frame.latestEvent;
  const player = event?.player ?? teamLabel(language, event?.team) ?? localizedPlayer(language);
  const score = `${frame.homeScore}-${frame.awayScore}`;
  const home = localizeTeamName(match.home.code, match.home.name, language);
  const away = localizeTeamName(match.away.code, match.away.name, language);

  if (!event) return localizedWaiting(language, match);

  if (event.type === "goal") {
    if (language === "en") return `${player} changed the match in minute ${frame.minute}; the score is now ${score}.`;
    if (language === "zh") return `${player}在${frame.minute}分钟改变了比赛走势，当前比分为 ${score}。`;
    if (language === "es") return `${player} cambia el partido en el minuto ${frame.minute}; el marcador es ${score}.`;
    if (language === "pt") return `${player} muda a partida aos ${frame.minute} minutos; o placar está ${score}.`;
    if (language === "fr") return `${player} change le match à la ${frame.minute}e minute; le score est ${score}.`;
    if (language === "de") return `${player} verändert das Spiel in Minute ${frame.minute}; der Stand ist ${score}.`;
    if (language === "ja") return `${player}が${frame.minute}分に試合の流れを変えました。スコアは ${score} です。`;
    if (language === "ar") return `${player} يغيّر مجرى المباراة في الدقيقة ${frame.minute}؛ النتيجة ${score}.`;
  }

  if (event.type === "odds_shift") {
    if (language === "en") return `Match momentum is ${frame.market.sentiment}/100. The pace and crowd energy are shifting.`;
    if (language === "zh") return `比赛热度为 ${frame.market.sentiment}/100，场上节奏和球迷气氛正在变化。`;
    if (language === "es") return `El ritmo del partido está en ${frame.market.sentiment}/100; cambian el juego y el ambiente.`;
    if (language === "pt") return `O ritmo do jogo está em ${frame.market.sentiment}/100; o jogo e a torcida mudam.`;
    if (language === "fr") return `Le rythme du match est à ${frame.market.sentiment}/100; le jeu et l'ambiance évoluent.`;
    if (language === "de") return `Die Spieldynamik liegt bei ${frame.market.sentiment}/100; Tempo und Stimmung verändern sich.`;
    if (language === "ja") return `試合の流れは ${frame.market.sentiment}/100。テンポとスタンドの空気が変化しています。`;
    if (language === "ar") return `إيقاع المباراة ${frame.market.sentiment}/100؛ يتغير اللعب وأجواء الجمهور.`;
  }

  if (event.type === "halftime") {
    if (language === "en") return `Half-time: ${home} ${score} ${away}. The second half will decide the match.`;
    if (language === "zh") return `半场快照：${home} ${score} ${away}，下半场将决定比赛走势。`;
    if (language === "es") return `Descanso: ${home} ${score} ${away}; la segunda parte definirá el rumbo.`;
    if (language === "pt") return `Intervalo: ${home} ${score} ${away}; o segundo tempo define o rumo.`;
    if (language === "fr") return `Mi-temps : ${home} ${score} ${away}; la seconde période décidera du rythme.`;
    if (language === "de") return `Halbzeit: ${home} ${score} ${away}; die zweite Hälfte entscheidet den Rhythmus.`;
    if (language === "ja") return `ハーフタイム: ${home} ${score} ${away}。後半が流れを決めます。`;
    if (language === "ar") return `نهاية الشوط الأول: ${home} ${score} ${away}؛ الشوط الثاني سيحدد الإيقاع.`;
  }

  if (event.type === "fulltime") {
    if (language === "en") return `Full-time: ${home} ${score} ${away}. The final score and event sequence are confirmed.`;
    if (language === "zh") return `全场结束：${home} ${score} ${away}，最终比分和比赛事件已确认。`;
    if (language === "es") return `Final: ${home} ${score} ${away}. Marcador y eventos confirmados.`;
    if (language === "pt") return `Final: ${home} ${score} ${away}. Placar e eventos confirmados.`;
    if (language === "fr") return `Fin du match : ${home} ${score} ${away}. Score et événements confirmés.`;
    if (language === "de") return `Abpfiff: ${home} ${score} ${away}. Ergebnis und Ereignisse sind bestätigt.`;
    if (language === "ja") return `試合終了: ${home} ${score} ${away}。最終スコアとイベントを確認しました。`;
    if (language === "ar") return `النهاية: ${home} ${score} ${away}. تم تأكيد النتيجة والأحداث.`;
  }

  if (event.type === "red_card") {
    if (language === "en") return `${player} received a red card in minute ${frame.minute}. Player numbers changed with the score at ${score}.`;
    if (language === "zh") return `${frame.minute}分钟，${player}被出示红牌，场上人数发生变化，当前比分 ${score}。`;
    if (language === "es") return `${player} recibe roja en el minuto ${frame.minute}; cambia el número de jugadores con ${score}.`;
    if (language === "pt") return `${player} recebe vermelho aos ${frame.minute}; muda o número de jogadores com ${score}.`;
    if (language === "fr") return `${player} reçoit un rouge à la ${frame.minute}e minute; le rapport de forces change à ${score}.`;
    if (language === "de") return `${player} sieht in Minute ${frame.minute} Rot; die Spielerzahl ändert sich beim Stand von ${score}.`;
    if (language === "ja") return `${frame.minute}分、${player}にレッドカード。人数が変わり、スコアは ${score} です。`;
    if (language === "ar") return `${player} يتلقى بطاقة حمراء في الدقيقة ${frame.minute}؛ تغير عدد اللاعبين والنتيجة ${score}.`;
  }

  if (event.type === "yellow_card") {
    if (language === "en") return `${player} received a yellow card in minute ${frame.minute}; the score remains ${score}.`;
    if (language === "zh") return `${frame.minute}分钟，${player}被出示黄牌，当前比分仍为 ${score}。`;
  }

  if (event.type === "score_update") {
    if (language === "en") return `The score state was reviewed in minute ${frame.minute}. The confirmed score is ${score}.`;
    if (language === "zh") return `${frame.minute}分钟，比分经过复核，当前确认比分为 ${score}。`;
  }

  return localizeEventDescription(language, event);
}

export function localizeInsight(language: PulseLanguage, match: MatchData, frame: PulseFrame) {
  const event = frame.latestEvent;
  const leader = frame.homeScore > frame.awayScore
    ? localizeTeamName(match.home.code, match.home.name, language)
    : frame.awayScore > frame.homeScore
      ? localizeTeamName(match.away.code, match.away.name, language)
      : "";
  if (language === "en") return frame.insight.headline;
  if (language === "zh") {
    if (!event) return "比赛等待第一个有效节点。";
    if (event.type === "goal" && frame.homeScore !== frame.awayScore) return `${leader}暂时领先，接下来关注双方的回应。`;
    if (event.type === "goal") return "比分暂平，球迷情绪重新洗牌。";
    if (event.type === "red_card") return "红牌改变了场上人数，接下来关注阵型和节奏变化。";
    if (event.type === "yellow_card") return "纪律压力上升，但比分尚未改变。";
    if (event.type === "score_update") return "比分已经复核，以当前确认结果为准。";
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
    if (event.type === "odds_shift") return "比赛热度发生变化。";
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
    if (event.type === "odds_shift") return "Cambia el ritmo del partido.";
    return "Evento verificado.";
  }
  if (language === "pt") {
    if (event.type === "goal") return `${player} marca; o placar fica ${score}.`;
    if (event.type === "yellow_card") return `${player} recebe cartão amarelo; o registro foi atualizado.`;
    if (event.type === "red_card") return `${player} recebe cartão vermelho; o número de jogadores muda.`;
    if (event.type === "substitution") return `${player} participa de uma substituição; o ritmo pode mudar.`;
    if (event.type === "halftime") return `Intervalo; o placar está ${score}.`;
    if (event.type === "fulltime") return `Final; o placar verificado é ${score}.`;
    if (event.type === "odds_shift") return "O ritmo do jogo mudou.";
    return "Evento verificado.";
  }
  if (language === "fr") {
    if (event.type === "goal") return `${player} marque; le score passe à ${score}.`;
    if (event.type === "yellow_card") return `${player} reçoit un carton jaune; l'événement est enregistré.`;
    if (event.type === "red_card") return `${player} reçoit un carton rouge; le nombre de joueurs change.`;
    if (event.type === "substitution") return `${player} participe à un remplacement; le rythme peut évoluer.`;
    if (event.type === "halftime") return `Mi-temps; le score est ${score}.`;
    if (event.type === "fulltime") return `Fin du match; le score vérifié est ${score}.`;
    if (event.type === "odds_shift") return "Le rythme du match évolue.";
    return "Événement vérifié.";
  }
  if (language === "de") {
    if (event.type === "goal") return `${player} trifft; der Stand ist ${score}.`;
    if (event.type === "yellow_card") return `${player} sieht Gelb; das Ereignis ist erfasst.`;
    if (event.type === "red_card") return `${player} sieht Rot; die Spielerzahl verändert sich.`;
    if (event.type === "substitution") return `${player} ist an einem Wechsel beteiligt; das Tempo kann sich ändern.`;
    if (event.type === "halftime") return `Halbzeit; der Stand ist ${score}.`;
    if (event.type === "fulltime") return `Abpfiff; der verifizierte Stand ist ${score}.`;
    if (event.type === "odds_shift") return "Die Spieldynamik verändert sich.";
    return "Verifiziertes Ereignis.";
  }
  if (language === "ja") {
    if (event.type === "goal") return `${player}が得点し、スコアは ${score} になりました。`;
    if (event.type === "yellow_card") return `${player}にイエローカード。記録を更新しました。`;
    if (event.type === "red_card") return `${player}にレッドカード。出場人数が変わります。`;
    if (event.type === "substitution") return `${player}が交代に関与。試合のテンポが変わる可能性があります。`;
    if (event.type === "halftime") return `ハーフタイム。スコアは ${score} です。`;
    if (event.type === "fulltime") return `試合終了。確認済みスコアは ${score} です。`;
    if (event.type === "odds_shift") return "試合の流れが変化しました。";
    return "確認済みイベント。";
  }
  if (event.type === "goal") return `${player} يسجل؛ النتيجة ${score}.`;
  if (event.type === "yellow_card") return `${player} يتلقى بطاقة صفراء؛ تم تسجيل الحدث.`;
  if (event.type === "red_card") return `${player} يتلقى بطاقة حمراء؛ يتغير عدد اللاعبين.`;
  if (event.type === "substitution") return `${player} يشارك في تبديل؛ قد يتغير إيقاع المباراة.`;
  if (event.type === "halftime") return `نهاية الشوط الأول؛ النتيجة ${score}.`;
  if (event.type === "fulltime") return `النهاية؛ النتيجة الموثقة ${score}.`;
  if (event.type === "odds_shift") return "تغير إيقاع المباراة.";
  return "حدث موثق.";
}

function localizedWaiting(language: PulseLanguage, match: MatchData) {
  const home = localizeTeamName(match.home.code, match.home.name, language);
  const away = localizeTeamName(match.away.code, match.away.name, language);
  if (language === "zh") return `${home} vs ${away} 正等待开赛，暂无已核验比赛事件。`;
  if (language === "es") return `${home} vs ${away} espera el inicio; aún no hay eventos verificados.`;
  if (language === "pt") return `${home} vs ${away} aguarda o início; ainda não há eventos verificados.`;
  if (language === "fr") return `${home} vs ${away} attend le coup d'envoi; aucun événement vérifié.`;
  if (language === "de") return `${home} vs ${away} wartet auf den Anpfiff; noch keine verifizierten Ereignisse.`;
  if (language === "ja") return `${home} vs ${away}はキックオフ待ちです。検証済みイベントはありません。`;
  if (language === "ar") return `${home} ضد ${away} بانتظار البداية؛ لا توجد أحداث موثقة بعد.`;
  return `${home} and ${away} are warming up the pulse before kickoff.`;
}

function teamLabel(language: PulseLanguage, code?: string) {
  if (!code) return undefined;
  if (language === "zh") return code === "HOME" ? "主队" : code === "AWAY" ? "客队" : code;
  return code;
}
