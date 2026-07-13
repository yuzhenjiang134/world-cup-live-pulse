import type { MatchData, MatchEvent, PulseFrame } from "../types";
import { localizeTeamName } from "../data/teamNames";

export type PulseLanguage = "en" | "zh" | "es" | "pt" | "fr" | "de" | "ja" | "ar";
export type ScheduledBriefMode = "call" | "why" | "recap";

export function localizeScheduledBrief(language: PulseLanguage, match: MatchData, mode: ScheduledBriefMode = "call") {
  const home = localizeTeamName(match.home.code, match.home.name, language);
  const away = localizeTeamName(match.away.code, match.away.name, language);
  const stage = localizedScheduledStage(language, match.stage);
  const kickoff = localizedKickoff(language, match.kickoffIso);
  const importance = localizedStageImportance(language, match.stage);

  if (mode === "why") {
    if (language === "zh") return `${importance ?? "这是下一场已确认赛程。"}比分挑战可在开赛前修改，开赛后自动锁定。`;
    if (language === "es") return `${importance ?? "Es el próximo partido confirmado."} Puedes editar el reto de marcador hasta el inicio; después queda bloqueado.`;
    if (language === "pt") return `${importance ?? "Esta é a próxima partida confirmada."} O palpite pode ser alterado até o início; depois fica bloqueado.`;
    if (language === "fr") return `${importance ?? "C'est le prochain match confirmé."} Le pronostic peut être modifié jusqu'au coup d'envoi, puis il est verrouillé.`;
    if (language === "de") return `${importance ?? "Dies ist das nächste bestätigte Spiel."} Der Tipp kann bis zum Anpfiff geändert werden und wird dann gesperrt.`;
    if (language === "ja") return `${importance ?? "次の確認済み試合です。"}スコア予想はキックオフまで変更でき、その後は自動的に締め切られます。`;
    if (language === "ar") return `${importance ?? "هذه هي المباراة المؤكدة التالية."} يمكن تعديل توقع النتيجة حتى البداية، ثم يُغلق تلقائياً.`;
    return `${importance ?? "This is the next confirmed fixture."} Edit your score challenge until kickoff; it locks automatically when the match starts.`;
  }

  if (mode === "recap") {
    const details = [stage, kickoff].filter(Boolean).join(" · ");
    if (language === "zh") return `赛前速览：${home}对阵${away}${details ? `，${details}` : ""}。目前没有已核验比赛事件；开赛后将跟进进球、牌和比分变化。`;
    if (language === "es") return `Previa rápida: ${home} contra ${away}${details ? ` · ${details}` : ""}. Aún no hay eventos verificados; tras el inicio seguirán goles, tarjetas y cambios de marcador.`;
    if (language === "pt") return `Prévia rápida: ${home} contra ${away}${details ? ` · ${details}` : ""}. Ainda não há eventos verificados; após o início entram gols, cartões e mudanças no placar.`;
    if (language === "fr") return `Avant-match express : ${home} contre ${away}${details ? ` · ${details}` : ""}. Aucun événement vérifié pour l'instant; buts, cartons et score suivront après le coup d'envoi.`;
    if (language === "de") return `Kurz vor dem Spiel: ${home} gegen ${away}${details ? ` · ${details}` : ""}. Noch keine verifizierten Ereignisse; nach Anpfiff folgen Tore, Karten und Spielstandsänderungen.`;
    if (language === "ja") return `試合前30秒まとめ：${home}対${away}${details ? `・${details}` : ""}。確認済みイベントはまだなく、開始後はゴール、カード、スコア変更を追跡します。`;
    if (language === "ar") return `ملخص ما قبل المباراة: ${home} ضد ${away}${details ? ` · ${details}` : ""}. لا توجد أحداث موثقة بعد؛ ستظهر الأهداف والبطاقات وتغييرات النتيجة بعد البداية.`;
    return `Pre-match catch-up: ${home} vs ${away}${details ? ` · ${details}` : ""}. No verified match events yet; goals, cards and score changes will appear after kickoff.`;
  }

  const details = [stage, kickoff].filter(Boolean).join(" · ");
  if (language === "zh") return `${home}对阵${away}${details ? `，${details}` : ""}。赛前比分挑战现已开放。`;
  if (language === "es") return `${home} contra ${away}${details ? ` · ${details}` : ""}. El reto de marcador ya está abierto.`;
  if (language === "pt") return `${home} contra ${away}${details ? ` · ${details}` : ""}. O desafio de placar já está aberto.`;
  if (language === "fr") return `${home} contre ${away}${details ? ` · ${details}` : ""}. Le défi de score est ouvert.`;
  if (language === "de") return `${home} gegen ${away}${details ? ` · ${details}` : ""}. Das Tippspiel ist jetzt geöffnet.`;
  if (language === "ja") return `${home}対${away}${details ? `・${details}` : ""}。スコアチャレンジ受付中です。`;
  if (language === "ar") return `${home} ضد ${away}${details ? ` · ${details}` : ""}. تحدي النتيجة مفتوح الآن.`;
  return `${home} vs ${away}${details ? ` · ${details}` : ""}. The score challenge is open.`;
}

export function localizeCommentary(language: PulseLanguage, match: MatchData, frame: PulseFrame) {
  const event = frame.latestEvent;
  const player = readablePlayerName(event?.player) ?? teamLabel(language, event?.team) ?? localizedPlayer(language);
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
  if (language === "en") {
    if (!event) return "The match is waiting for its first verified event.";
    if (event.type === "goal" && frame.homeScore !== frame.awayScore) return `${leader} leads; the next verified response is the moment to watch.`;
    if (event.type === "goal") return "The score is level again, so the match story has reset.";
    if (event.type === "red_card") return "The red card changes the number of players and the tactical balance.";
    if (event.type === "yellow_card") return "Disciplinary pressure has risen, while the score is unchanged.";
    if (event.type === "score_update") return "The score state was reviewed; the confirmed value now takes priority.";
    if (event.type === "halftime") return "Half-time creates a clean before-and-after checkpoint.";
    if (event.type === "fulltime") return "The final score and event path are confirmed for replay and challenge settlement.";
    return "Match momentum is changing; follow the verified event trail.";
  }
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
  if (language === "es") {
    if (!event) return "El partido espera su primer evento verificado.";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "El marcador vuelve a estar igualado y cambia el relato." : `${leader} toma ventaja; ahora importa la respuesta verificada.`;
    if (event.type === "red_card") return "La roja cambia el número de jugadores y el equilibrio táctico.";
    if (event.type === "yellow_card") return "Aumenta la presión disciplinaria, sin cambio en el marcador.";
    if (event.type === "score_update") return "El marcador fue revisado; prevalece el valor confirmado.";
    if (event.type === "halftime") return "El descanso marca un punto claro para comparar las dos mitades.";
    if (event.type === "fulltime") return "Marcador y secuencia confirmados para repetición y resolución del reto.";
    return "El pulso cambia; sigue los eventos verificados.";
  }
  if (language === "pt") {
    if (!event) return "A partida aguarda o primeiro evento verificado.";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "O placar volta a ficar empatado e a história recomeça." : `${leader} assume a frente; agora importa a resposta verificada.`;
    if (event.type === "red_card") return "O cartão vermelho muda o número de jogadores e o equilíbrio tático.";
    if (event.type === "yellow_card") return "A pressão disciplinar aumenta, sem mudança no placar.";
    if (event.type === "score_update") return "O placar foi revisado; o valor confirmado tem prioridade.";
    if (event.type === "halftime") return "O intervalo cria um ponto claro para comparar os dois tempos.";
    if (event.type === "fulltime") return "Placar e sequência confirmados para replay e apuração do desafio.";
    return "O pulso muda; acompanhe os eventos verificados.";
  }
  if (language === "fr") {
    if (!event) return "Le match attend son premier événement vérifié.";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "Le score est de nouveau à égalité et le récit repart." : `${leader} mène; la prochaine réponse vérifiée devient essentielle.`;
    if (event.type === "red_card") return "Le carton rouge modifie le nombre de joueurs et l'équilibre tactique.";
    if (event.type === "yellow_card") return "La pression disciplinaire augmente, sans changement de score.";
    if (event.type === "score_update") return "Le score a été revu; la valeur confirmée prévaut.";
    if (event.type === "halftime") return "La pause crée un repère clair entre les deux périodes.";
    if (event.type === "fulltime") return "Score et séquence confirmés pour le replay et le défi.";
    return "Le pouls évolue; suivez les événements vérifiés.";
  }
  if (language === "de") {
    if (!event) return "Das Spiel wartet auf das erste verifizierte Ereignis.";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "Der Spielstand ist wieder ausgeglichen und die Geschichte beginnt neu." : `${leader} führt; jetzt zählt die nächste verifizierte Reaktion.`;
    if (event.type === "red_card") return "Die Rote Karte verändert Spielerzahl und taktische Balance.";
    if (event.type === "yellow_card") return "Der disziplinarische Druck steigt, der Spielstand bleibt gleich.";
    if (event.type === "score_update") return "Der Spielstand wurde geprüft; der bestätigte Wert gilt.";
    if (event.type === "halftime") return "Die Halbzeit setzt einen klaren Vergleichspunkt.";
    if (event.type === "fulltime") return "Endstand und Ereignisfolge sind für Replay und Tippspiel bestätigt.";
    return "Der Puls verändert sich; folge den verifizierten Ereignissen.";
  }
  if (language === "ja") {
    if (!event) return "最初の確認済みイベントを待っています。";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "同点に戻り、試合の物語が組み直されました。" : `${leader}がリード。次の確認済みリアクションが焦点です。`;
    if (event.type === "red_card") return "レッドカードで人数と戦術バランスが変わりました。";
    if (event.type === "yellow_card") return "警告の圧力が高まりましたが、スコアは変わりません。";
    if (event.type === "score_update") return "スコアが再確認され、確認済みの値が優先されます。";
    if (event.type === "halftime") return "ハーフタイムは前後半を比べる明確な節目です。";
    if (event.type === "fulltime") return "最終スコアとイベント経路がリプレイとチャレンジ判定用に確定しました。";
    return "試合の流れが変化しています。確認済みイベントを追ってください。";
  }
  if (!event) return "تنتظر المباراة أول حدث موثق.";
  if (event.type === "goal") return frame.homeScore === frame.awayScore ? "عادت النتيجة إلى التعادل وبدأت قصة المباراة من جديد." : `${leader} يتقدم؛ التركيز الآن على الرد الموثق التالي.`;
  if (event.type === "red_card") return "تغير البطاقة الحمراء عدد اللاعبين والتوازن التكتيكي.";
  if (event.type === "yellow_card") return "يرتفع الضغط الانضباطي بينما تبقى النتيجة كما هي.";
  if (event.type === "score_update") return "تمت مراجعة النتيجة؛ القيمة المؤكدة هي المعتمدة.";
  if (event.type === "halftime") return "نهاية الشوط الأول تمنح نقطة مقارنة واضحة.";
  if (event.type === "fulltime") return "تم تأكيد النتيجة ومسار الأحداث للإعادة وحسم التحدي.";
  return "يتغير النبض؛ تابع الأحداث الموثقة.";
}

function localizedKickoff(language: PulseLanguage, kickoffIso?: string) {
  if (!kickoffIso) return undefined;
  const date = new Date(kickoffIso);
  if (!Number.isFinite(date.getTime())) return undefined;
  const locale = language === "zh" ? "zh-CN" : language === "pt" ? "pt-BR" : language;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function localizedScheduledStage(language: PulseLanguage, stage?: string) {
  if (!stage) return undefined;
  const normalized = stage.toLowerCase().replace(/[-_]/g, " ");
  const key = normalized.includes("round of 32") ? "round32"
    : normalized.includes("round of 16") ? "round16"
      : normalized.includes("quarter") ? "quarter"
        : normalized.includes("semi") ? "semi"
          : /\bfinals?\b/.test(normalized) ? "final"
            : normalized.includes("group") ? "group"
              : undefined;
  if (!key) return undefined;
  const labels = {
    en: { round32: "Round of 32", round16: "Round of 16", quarter: "Quarter-final", semi: "Semi-final", final: "Final", group: "Group stage" },
    zh: { round32: "32 强", round16: "16 强", quarter: "四分之一决赛", semi: "半决赛", final: "决赛", group: "小组赛" },
    es: { round32: "Dieciseisavos", round16: "Octavos", quarter: "Cuartos", semi: "Semifinal", final: "Final", group: "Fase de grupos" },
    pt: { round32: "Fase de 32", round16: "Oitavas", quarter: "Quartas", semi: "Semifinal", final: "Final", group: "Fase de grupos" },
    fr: { round32: "Seizièmes", round16: "Huitièmes", quarter: "Quart de finale", semi: "Demi-finale", final: "Finale", group: "Phase de groupes" },
    de: { round32: "Runde der 32", round16: "Achtelfinale", quarter: "Viertelfinale", semi: "Halbfinale", final: "Finale", group: "Gruppenphase" },
    ja: { round32: "ラウンド32", round16: "ベスト16", quarter: "準々決勝", semi: "準決勝", final: "決勝", group: "グループステージ" },
    ar: { round32: "دور 32", round16: "دور 16", quarter: "ربع النهائي", semi: "نصف النهائي", final: "النهائي", group: "دور المجموعات" },
  } as const;
  return labels[language][key];
}

function localizedStageImportance(language: PulseLanguage, stage?: string) {
  if (!stage) return undefined;
  const normalized = stage.toLowerCase().replace(/[-_]/g, " ");
  const key = /\bfinals?\b/.test(normalized) && !normalized.includes("semi") && !normalized.includes("quarter") ? "title"
    : normalized.includes("semi") ? "final"
      : normalized.includes("quarter") ? "semi"
        : normalized.includes("round of 16") || normalized.includes("round of 32") ? "next"
          : undefined;
  if (!key) return undefined;
  const lines = {
    en: { title: "The World Cup title is at stake.", final: "A place in the final is at stake.", semi: "A place in the semi-final is at stake.", next: "Progress to the next knockout round is at stake." },
    zh: { title: "世界杯冠军将在这里决出。", final: "胜者将晋级决赛。", semi: "胜者将晋级半决赛。", next: "胜者将进入下一轮淘汰赛。" },
    es: { title: "Está en juego el título mundial.", final: "Está en juego un lugar en la final.", semi: "Está en juego un lugar en semifinales.", next: "Está en juego el pase a la siguiente ronda." },
    pt: { title: "O título mundial está em jogo.", final: "Uma vaga na final está em jogo.", semi: "Uma vaga na semifinal está em jogo.", next: "A classificação à próxima fase está em jogo." },
    fr: { title: "Le titre mondial est en jeu.", final: "Une place en finale est en jeu.", semi: "Une place en demi-finale est en jeu.", next: "La qualification pour le tour suivant est en jeu." },
    de: { title: "Es geht um den WM-Titel.", final: "Ein Platz im Finale steht auf dem Spiel.", semi: "Ein Platz im Halbfinale steht auf dem Spiel.", next: "Es geht um den Einzug in die nächste Runde." },
    ja: { title: "ワールドカップ優勝が懸かります。", final: "決勝進出が懸かります。", semi: "準決勝進出が懸かります。", next: "次の決勝トーナメント進出が懸かります。" },
    ar: { title: "لقب كأس العالم على المحك.", final: "بطاقة التأهل إلى النهائي على المحك.", semi: "بطاقة التأهل إلى نصف النهائي على المحك.", next: "التأهل إلى الدور الإقصائي التالي على المحك." },
  } as const;
  return lines[language][key];
}

export function localizeRecap(language: PulseLanguage, match: MatchData, frame: PulseFrame) {
  const events = frame.activeEvents ?? [];
  const goals = events.filter((event) => event.type === "goal").length;
  const cards = events.filter((event) => event.type === "yellow_card" || event.type === "red_card").length;
  const score = `${frame.homeScore}-${frame.awayScore}`;
  const home = localizeTeamName(match.home.code, match.home.name, language);
  const away = localizeTeamName(match.away.code, match.away.name, language);
  const latest = frame.latestEvent ? localizeEventDescription(language, frame.latestEvent) : localizedWaiting(language, match);

  if (language === "zh") return `快速补课：${home} ${score} ${away}。已确认 ${goals} 个进球和 ${cards} 张牌。最新节点：${latest}`;
  if (language === "es") return `Resumen rápido: ${home} ${score} ${away}. Hay ${goals} goles y ${cards} tarjetas verificadas. Último momento: ${latest}`;
  if (language === "pt") return `Resumo rápido: ${home} ${score} ${away}. Há ${goals} gols e ${cards} cartões verificados. Último momento: ${latest}`;
  if (language === "fr") return `Récap express : ${home} ${score} ${away}. ${goals} buts et ${cards} cartons sont vérifiés. Dernier moment : ${latest}`;
  if (language === "de") return `Schnellüberblick: ${home} ${score} ${away}. Bestätigt sind ${goals} Tore und ${cards} Karten. Letzter Moment: ${latest}`;
  if (language === "ja") return `30秒まとめ：${home} ${score} ${away}。確認済みはゴール${goals}件、カード${cards}件。最新：${latest}`;
  if (language === "ar") return `ملخص سريع: ${home} ${score} ${away}. تم توثيق ${goals} أهداف و${cards} بطاقات. آخر لحظة: ${latest}`;
  const goalLabel = goals === 1 ? "goal" : "goals";
  const cardLabel = cards === 1 ? "card" : "cards";
  return `Quick catch-up: ${home} ${score} ${away}. ${goals} ${goalLabel} and ${cards} ${cardLabel} are verified. Latest: ${latest}`;
}

export function localizeEventDescription(language: PulseLanguage, event: MatchEvent) {
  const player = readablePlayerName(event.player) ?? teamLabel(language, event.team) ?? localizedPlayer(language);
  const score = `${event.homeScore}-${event.awayScore}`;
  if (language === "en") {
    if (event.type === "goal") return `${player} scored; the score is now ${score}.`;
    if (event.type === "yellow_card") return `${player} received a yellow card.`;
    if (event.type === "red_card") return `${player} received a red card; the number of players changed.`;
    if (event.type === "substitution") return `${player} was involved in a substitution.`;
    if (event.type === "halftime") return `Half-time; the score is ${score}.`;
    if (event.type === "fulltime") return `Full-time; the verified score is ${score}.`;
    if (event.type === "odds_shift") return "The match momentum changed.";
    if (event.type === "score_update") return `The score was reviewed and confirmed at ${score}.`;
    return "Verified match event.";
  }
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

function readablePlayerName(candidate?: string) {
  if (!candidate) return undefined;
  const normalized = candidate.trim();
  if (!normalized || /^#?\d+$/.test(normalized) || /^player\s*#?\d+$/i.test(normalized)) return undefined;
  return normalized;
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
  if (language === "zh") return `${home}对阵${away}，正等待开赛，暂无已核验比赛事件。`;
  if (language === "es") return `${home} contra ${away} espera el inicio; aún no hay eventos verificados.`;
  if (language === "pt") return `${home} contra ${away} aguarda o início; ainda não há eventos verificados.`;
  if (language === "fr") return `${home} contre ${away} attend le coup d'envoi; aucun événement vérifié.`;
  if (language === "de") return `${home} gegen ${away} wartet auf den Anpfiff; noch keine verifizierten Ereignisse.`;
  if (language === "ja") return `${home}対${away}はキックオフ待ちです。検証済みイベントはありません。`;
  if (language === "ar") return `${home} ضد ${away} بانتظار البداية؛ لا توجد أحداث موثقة بعد.`;
  return `${home} and ${away} are warming up the pulse before kickoff.`;
}

function teamLabel(language: PulseLanguage, code?: string) {
  if (!code) return undefined;
  if (language === "zh") return code === "HOME" ? "主队" : code === "AWAY" ? "客队" : code;
  return code;
}
