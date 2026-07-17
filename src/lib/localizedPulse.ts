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
    if (language === "zh") return `赛前速览：${home}对阵${away}${details ? `，${details}` : ""}。比赛尚未开始；开赛后将跟进进球、牌和比分变化。`;
    if (language === "es") return `Previa rápida: ${home} contra ${away}${details ? ` · ${details}` : ""}. El partido aún no ha comenzado; después llegarán goles, tarjetas y cambios de marcador.`;
    if (language === "pt") return `Prévia rápida: ${home} contra ${away}${details ? ` · ${details}` : ""}. A partida ainda não começou; depois entram gols, cartões e mudanças no placar.`;
    if (language === "fr") return `Avant-match express : ${home} contre ${away}${details ? ` · ${details}` : ""}. Le match n'a pas encore commencé; buts, cartons et score suivront après le coup d'envoi.`;
    if (language === "de") return `Kurz vor dem Spiel: ${home} gegen ${away}${details ? ` · ${details}` : ""}. Das Spiel hat noch nicht begonnen; danach folgen Tore, Karten und Spielstandsänderungen.`;
    if (language === "ja") return `試合前30秒まとめ：${home}対${away}${details ? `・${details}` : ""}。試合はまだ始まっていません。開始後はゴール、カード、スコア変更を追跡します。`;
    if (language === "ar") return `ملخص ما قبل المباراة: ${home} ضد ${away}${details ? ` · ${details}` : ""}. لم تبدأ المباراة بعد؛ ستظهر الأهداف والبطاقات وتغييرات النتيجة بعد البداية.`;
    return `Pre-match catch-up: ${home} vs ${away}${details ? ` · ${details}` : ""}. The match has not started yet; goals, cards and score changes will appear after kickoff.`;
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
  const minute = eventMinuteLabel(event, frame.minute);
  const withAddedTime = (line: string) => isAddedTimeEvent(event) ? `${localizedAddedTimeLead(language)}${line}` : line;

  if (event.type === "goal") {
    if (event.penalty) return withAddedTime(localizedPenaltyGoal(language, player, minute, score));
    if (language === "en") return withAddedTime(`${player} changed the match in minute ${minute}; the score is now ${score}.`);
    if (language === "zh") return withAddedTime(`${player}在${minute}分钟完成进球，当前比分为 ${score}。`);
    if (language === "es") return withAddedTime(`${player} cambia el partido en el minuto ${minute}; el marcador es ${score}.`);
    if (language === "pt") return withAddedTime(`${player} muda a partida aos ${minute} minutos; o placar está ${score}.`);
    if (language === "fr") return withAddedTime(`${player} change le match à la ${minute}e minute; le score est ${score}.`);
    if (language === "de") return withAddedTime(`${player} verändert das Spiel in Minute ${minute}; der Stand ist ${score}.`);
    if (language === "ja") return withAddedTime(`${player}が${minute}分に得点しました。スコアは ${score} です。`);
    if (language === "ar") return withAddedTime(`${player} يغيّر مجرى المباراة في الدقيقة ${minute}؛ النتيجة ${score}.`);
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
    if (language === "en") return `Full-time: ${home} ${score} ${away}. Replay the goals, cards and decisive moments.`;
    if (language === "zh") return `全场结束：${home} ${score} ${away}，现在可以回看进球、罚牌和决定性时刻。`;
    if (language === "es") return `Final: ${home} ${score} ${away}. Marcador y eventos confirmados.`;
    if (language === "pt") return `Final: ${home} ${score} ${away}. Placar e eventos confirmados.`;
    if (language === "fr") return `Fin du match : ${home} ${score} ${away}. Score et événements confirmés.`;
    if (language === "de") return `Abpfiff: ${home} ${score} ${away}. Ergebnis und Ereignisse sind bestätigt.`;
    if (language === "ja") return `試合終了: ${home} ${score} ${away}。最終スコアとイベントを確認しました。`;
    if (language === "ar") return `النهاية: ${home} ${score} ${away}. تم تأكيد النتيجة والأحداث.`;
  }

  if (event.type === "red_card") {
    if (language === "en") return withAddedTime(`${player} received a red card in minute ${minute}. Player numbers changed with the score at ${score}.`);
    if (language === "zh") return withAddedTime(`${minute}分钟，${player}被出示红牌，场上人数发生变化，当前比分 ${score}。`);
    if (language === "es") return withAddedTime(`${player} recibe roja en el minuto ${minute}; cambia el número de jugadores con ${score}.`);
    if (language === "pt") return withAddedTime(`${player} recebe vermelho aos ${minute}; muda o número de jogadores com ${score}.`);
    if (language === "fr") return withAddedTime(`${player} reçoit un rouge à la ${minute}e minute; le rapport de forces change à ${score}.`);
    if (language === "de") return withAddedTime(`${player} sieht in Minute ${minute} Rot; die Spielerzahl ändert sich beim Stand von ${score}.`);
    if (language === "ja") return withAddedTime(`${minute}分、${player}にレッドカード。人数が変わり、スコアは ${score} です。`);
    if (language === "ar") return withAddedTime(`${player} يتلقى بطاقة حمراء في الدقيقة ${minute}؛ تغير عدد اللاعبين والنتيجة ${score}.`);
  }

  if (event.type === "yellow_card") {
    if (language === "en") return withAddedTime(`${player} received a yellow card in minute ${minute}; the score remains ${score}.`);
    if (language === "zh") return withAddedTime(`${minute}分钟，${player}被出示黄牌，当前比分仍为 ${score}。`);
    if (language === "es") return withAddedTime(`${player} recibe una amarilla en el minuto ${minute}; el marcador sigue ${score}.`);
    if (language === "pt") return withAddedTime(`${player} recebe amarelo aos ${minute} minutos; o placar segue ${score}.`);
    if (language === "fr") return withAddedTime(`${player} reçoit un carton jaune à la ${minute}e minute; le score reste ${score}.`);
    if (language === "de") return withAddedTime(`${player} sieht in Minute ${minute} Gelb; der Stand bleibt ${score}.`);
    if (language === "ja") return withAddedTime(`${minute}分、${player}にイエローカード。スコアは ${score} のままです。`);
    if (language === "ar") return withAddedTime(`${player} يتلقى بطاقة صفراء في الدقيقة ${minute}؛ تبقى النتيجة ${score}.`);
  }

  if (event.type === "score_update") {
    if (language === "en") return withAddedTime(`Minute ${minute}: the score is ${score}, and play continues.`);
    if (language === "zh") return withAddedTime(`${minute}分钟，当前比分 ${score}，比赛继续。`);
    if (language === "es") return withAddedTime(`Minuto ${minute}: el marcador es ${score} y el juego continúa.`);
    if (language === "pt") return withAddedTime(`Aos ${minute} minutos, o placar é ${score} e o jogo continua.`);
    if (language === "fr") return withAddedTime(`${minute}e minute : le score est de ${score} et le jeu continue.`);
    if (language === "de") return withAddedTime(`Minute ${minute}: Es steht ${score}, das Spiel läuft weiter.`);
    if (language === "ja") return withAddedTime(`${minute}分、スコアは ${score}。試合は続きます。`);
    if (language === "ar") return withAddedTime(`الدقيقة ${minute}: النتيجة ${score} والمباراة مستمرة.`);
  }

  return withAddedTime(localizeEventDescription(language, event));
}

export function localizeInsight(language: PulseLanguage, match: MatchData, frame: PulseFrame) {
  const event = frame.latestEvent;
  const home = localizeTeamName(match.home.code, match.home.name, language);
  const away = localizeTeamName(match.away.code, match.away.name, language);
  const finalScore = `${home} ${frame.homeScore}-${frame.awayScore} ${away}`;
  const leader = frame.homeScore > frame.awayScore
    ? home
    : frame.awayScore > frame.homeScore
      ? away
      : "";
  if (language === "en") {
    if (!event) return "The match is waiting for its first moment.";
    if (event.type === "goal" && frame.homeScore !== frame.awayScore) return `${leader} leads; the next response is the moment to watch.`;
    if (event.type === "goal") return "The score is level again, so the match story has reset.";
    if (event.type === "red_card") return "The red card changes the number of players and the tactical balance.";
    if (event.type === "yellow_card") return "Disciplinary pressure has risen, while the score is unchanged.";
    if (event.type === "score_update") return "The score is clear for now, so attention turns to the next attack.";
    if (event.type === "halftime") return "Half-time creates a clean before-and-after checkpoint.";
    if (event.type === "fulltime") return "The replay is ready to be shared as a complete fan story.";
    return "Match momentum is changing; follow the key moments.";
  }
  if (language === "zh") {
    if (!event) return "比赛等待第一个关键时刻。";
    if (event.type === "goal" && frame.homeScore !== frame.awayScore) return `${leader}暂时领先，接下来关注双方的回应。`;
    if (event.type === "goal") return "比分暂平，球迷情绪重新洗牌。";
    if (event.type === "red_card") return "红牌改变了场上人数，接下来关注阵型和节奏变化。";
    if (event.type === "yellow_card") return "纪律压力上升，但比分尚未改变。";
    if (event.type === "score_update") return "比分已经明确，接下来就看谁能创造下一次机会。";
    if (event.type === "halftime") return "半场形成清晰的前后对照。";
    if (event.type === "fulltime") return "回放已完成，可作为完整的球迷故事查看。";
    return "比赛节奏正在变化，继续关注关键时刻。";
  }
  if (language === "es") {
    if (!event) return "El partido espera su primera jugada importante.";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "El marcador vuelve a estar igualado y cambia el relato." : `${leader} toma ventaja; ahora importa la respuesta del rival.`;
    if (event.type === "red_card") return "La roja cambia el número de jugadores y el equilibrio táctico.";
    if (event.type === "yellow_card") return "Aumenta la presión disciplinaria, sin cambio en el marcador.";
    if (event.type === "score_update") return "El marcador está claro; ahora importa quién crea la próxima ocasión.";
    if (event.type === "halftime") return "El descanso marca un punto claro para comparar las dos mitades.";
    if (event.type === "fulltime") return `Final: ${finalScore}. Repasa goles y tarjetas o comprueba tu reto de marcador.`;
    return "El pulso cambia; sigue las jugadas clave.";
  }
  if (language === "pt") {
    if (!event) return "A partida aguarda o primeiro lance importante.";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "O placar volta a ficar empatado e a história recomeça." : `${leader} assume a frente; agora importa a resposta do adversário.`;
    if (event.type === "red_card") return "O cartão vermelho muda o número de jogadores e o equilíbrio tático.";
    if (event.type === "yellow_card") return "A pressão disciplinar aumenta, sem mudança no placar.";
    if (event.type === "score_update") return "O placar está claro; agora vale ver quem cria a próxima chance.";
    if (event.type === "halftime") return "O intervalo cria um ponto claro para comparar os dois tempos.";
    if (event.type === "fulltime") return `Fim de jogo: ${finalScore}. Reveja gols e cartões ou confira o desafio de placar.`;
    return "O pulso muda; acompanhe os lances decisivos.";
  }
  if (language === "fr") {
    if (!event) return "Le match attend sa première action importante.";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "Le score est de nouveau à égalité et le récit repart." : `${leader} mène; la réponse adverse devient essentielle.`;
    if (event.type === "red_card") return "Le carton rouge modifie le nombre de joueurs et l'équilibre tactique.";
    if (event.type === "yellow_card") return "La pression disciplinaire augmente, sans changement de score.";
    if (event.type === "score_update") return "Le score est clair; place maintenant à la prochaine occasion.";
    if (event.type === "halftime") return "La pause crée un repère clair entre les deux périodes.";
    if (event.type === "fulltime") return `Terminé : ${finalScore}. Revoyez les buts et cartons ou vérifiez votre défi score.`;
    return "Le rythme évolue; suivez les actions décisives.";
  }
  if (language === "de") {
    if (!event) return "Das Spiel wartet auf die erste wichtige Szene.";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "Der Spielstand ist wieder ausgeglichen und die Geschichte beginnt neu." : `${leader} führt; jetzt zählt die Reaktion des Gegners.`;
    if (event.type === "red_card") return "Die Rote Karte verändert Spielerzahl und taktische Balance.";
    if (event.type === "yellow_card") return "Der disziplinarische Druck steigt, der Spielstand bleibt gleich.";
    if (event.type === "score_update") return "Der Spielstand ist klar; jetzt zählt die nächste Chance.";
    if (event.type === "halftime") return "Die Halbzeit setzt einen klaren Vergleichspunkt.";
    if (event.type === "fulltime") return `Abpfiff: ${finalScore}. Tore und Karten ansehen oder den Ergebnis-Tipp prüfen.`;
    return "Das Spiel kippt; folge den entscheidenden Szenen.";
  }
  if (language === "ja") {
    if (!event) return "最初の重要なプレーを待っています。";
    if (event.type === "goal") return frame.homeScore === frame.awayScore ? "同点に戻り、試合の物語が組み直されました。" : `${leader}がリード。相手の反撃が焦点です。`;
    if (event.type === "red_card") return "レッドカードで人数と戦術バランスが変わりました。";
    if (event.type === "yellow_card") return "警告の圧力が高まりましたが、スコアは変わりません。";
    if (event.type === "score_update") return "スコアは明確です。次のチャンスに注目です。";
    if (event.type === "halftime") return "ハーフタイムは前後半を比べる明確な節目です。";
    if (event.type === "fulltime") return `試合終了：${finalScore}。ゴールとカードを振り返るか、スコアチャレンジを確認できます。`;
    return "試合の流れが変化しています。決定的なプレーを追ってください。";
  }
  if (!event) return "تنتظر المباراة أول لقطة مهمة.";
  if (event.type === "goal") return frame.homeScore === frame.awayScore ? "عادت النتيجة إلى التعادل وبدأت قصة المباراة من جديد." : `${leader} يتقدم؛ التركيز الآن على رد المنافس.`;
  if (event.type === "red_card") return "تغير البطاقة الحمراء عدد اللاعبين والتوازن التكتيكي.";
  if (event.type === "yellow_card") return "يرتفع الضغط الانضباطي بينما تبقى النتيجة كما هي.";
  if (event.type === "score_update") return "النتيجة واضحة الآن؛ التركيز على الفرصة التالية.";
  if (event.type === "halftime") return "نهاية الشوط الأول تمنح نقطة مقارنة واضحة.";
  if (event.type === "fulltime") return `نهاية المباراة: ${finalScore}. راجع الأهداف والبطاقات أو تحقق من تحدي النتيجة.`;
  return "يتغير إيقاع المباراة؛ تابع اللقطات الحاسمة.";
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
          : normalized.includes("bronze") || normalized.includes("third place") ? "bronze"
            : /\bfinals?\b/.test(normalized) ? "final"
              : normalized.includes("group") ? "group"
                : undefined;
  if (!key) return undefined;
  const labels = {
    en: { round32: "Round of 32", round16: "Round of 16", quarter: "Quarter-final", semi: "Semi-final", bronze: "Third-place match", final: "Final", group: "Group stage" },
    zh: { round32: "32 强", round16: "16 强", quarter: "四分之一决赛", semi: "半决赛", bronze: "季军赛", final: "决赛", group: "小组赛" },
    es: { round32: "Dieciseisavos", round16: "Octavos", quarter: "Cuartos", semi: "Semifinal", bronze: "Partido por el tercer puesto", final: "Final", group: "Fase de grupos" },
    pt: { round32: "Fase de 32", round16: "Oitavas", quarter: "Quartas", semi: "Semifinal", bronze: "Disputa do terceiro lugar", final: "Final", group: "Fase de grupos" },
    fr: { round32: "Seizièmes", round16: "Huitièmes", quarter: "Quart de finale", semi: "Demi-finale", bronze: "Match pour la troisième place", final: "Finale", group: "Phase de groupes" },
    de: { round32: "Runde der 32", round16: "Achtelfinale", quarter: "Viertelfinale", semi: "Halbfinale", bronze: "Spiel um Platz drei", final: "Finale", group: "Gruppenphase" },
    ja: { round32: "ラウンド32", round16: "ベスト16", quarter: "準々決勝", semi: "準決勝", bronze: "3位決定戦", final: "決勝", group: "グループステージ" },
    ar: { round32: "دور 32", round16: "دور 16", quarter: "ربع النهائي", semi: "نصف النهائي", bronze: "مباراة المركز الثالث", final: "النهائي", group: "دور المجموعات" },
  } as const;
  return labels[language][key];
}

function localizedStageImportance(language: PulseLanguage, stage?: string) {
  if (!stage) return undefined;
  const normalized = stage.toLowerCase().replace(/[-_]/g, " ");
  const key = normalized.includes("bronze") || normalized.includes("third place") ? "bronze"
    : /\bfinals?\b/.test(normalized) && !normalized.includes("semi") && !normalized.includes("quarter") ? "title"
      : normalized.includes("semi") ? "final"
        : normalized.includes("quarter") ? "semi"
          : normalized.includes("round of 16") || normalized.includes("round of 32") ? "next"
            : undefined;
  if (!key) return undefined;
  const lines = {
    en: { bronze: "Third place is at stake.", title: "The World Cup title is at stake.", final: "A place in the final is at stake.", semi: "A place in the semi-final is at stake.", next: "Progress to the next knockout round is at stake." },
    zh: { bronze: "两队将争夺世界杯季军。", title: "世界杯冠军将在这里决出。", final: "胜者将晋级决赛。", semi: "胜者将晋级半决赛。", next: "胜者将进入下一轮淘汰赛。" },
    es: { bronze: "Está en juego el tercer puesto.", title: "Está en juego el título mundial.", final: "Está en juego un lugar en la final.", semi: "Está en juego un lugar en semifinales.", next: "Está en juego el pase a la siguiente ronda." },
    pt: { bronze: "O terceiro lugar está em jogo.", title: "O título mundial está em jogo.", final: "Uma vaga na final está em jogo.", semi: "Uma vaga na semifinal está em jogo.", next: "A classificação à próxima fase está em jogo." },
    fr: { bronze: "La troisième place est en jeu.", title: "Le titre mondial est en jeu.", final: "Une place en finale est en jeu.", semi: "Une place en demi-finale est en jeu.", next: "La qualification pour le tour suivant est en jeu." },
    de: { bronze: "Platz drei steht auf dem Spiel.", title: "Es geht um den WM-Titel.", final: "Ein Platz im Finale steht auf dem Spiel.", semi: "Ein Platz im Halbfinale steht auf dem Spiel.", next: "Es geht um den Einzug in die nächste Runde." },
    ja: { bronze: "3位を懸けた一戦です。", title: "ワールドカップ優勝が懸かります。", final: "決勝進出が懸かります。", semi: "準決勝進出が懸かります。", next: "次の決勝トーナメント進出が懸かります。" },
    ar: { bronze: "المركز الثالث على المحك.", title: "لقب كأس العالم على المحك.", final: "بطاقة التأهل إلى النهائي على المحك.", semi: "بطاقة التأهل إلى نصف النهائي على المحك.", next: "التأهل إلى الدور الإقصائي التالي على المحك." },
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
  const recent = events
    .filter((event) => ["kickoff", "goal", "yellow_card", "red_card", "substitution", "halftime", "fulltime", "score_update"].includes(event.type))
    .slice(-2)
    .map((event) => `${eventMinuteLabel(event, event.minute)}' ${localizeEventDescription(language, event)}`)
    .join(" / ") || localizedWaiting(language, match);

  if (language === "zh") return `快速补课：${home} ${score} ${away}。比赛出现 ${goals} 个进球和 ${cards} 张牌。最近两个关键时刻：${recent}`;
  if (language === "es") return `Resumen rápido: ${home} ${score} ${away}. El partido tuvo ${goals} goles y ${cards} tarjetas. Dos momentos recientes: ${recent}`;
  if (language === "pt") return `Resumo rápido: ${home} ${score} ${away}. A partida teve ${goals} gols e ${cards} cartões. Dois momentos recentes: ${recent}`;
  if (language === "fr") return `Récap express : ${home} ${score} ${away}. Le match compte ${goals} buts et ${cards} cartons. Deux moments récents : ${recent}`;
  if (language === "de") return `Schnellüberblick: ${home} ${score} ${away}. Das Spiel hatte ${goals} Tore und ${cards} Karten. Zwei letzte Momente: ${recent}`;
  if (language === "ja") return `30秒まとめ：${home} ${score} ${away}。ゴール${goals}件、カード${cards}件。直近2場面：${recent}`;
  if (language === "ar") return `ملخص سريع: ${home} ${score} ${away}. شهدت المباراة ${goals} أهداف و${cards} بطاقات. آخر لحظتين: ${recent}`;
  const goalLabel = goals === 1 ? "goal" : "goals";
  const cardLabel = cards === 1 ? "card" : "cards";
  return `Quick catch-up: ${home} ${score} ${away}. The match had ${goals} ${goalLabel} and ${cards} ${cardLabel}. Two latest moments: ${recent}`;
}

export function localizeEventDescription(language: PulseLanguage, event: MatchEvent) {
  const readablePlayer = readablePlayerName(event.player);
  const player = readablePlayer ?? teamLabel(language, event.team) ?? localizedPlayer(language);
  const score = `${event.homeScore}-${event.awayScore}`;
  if (event.type === "goal" && event.penalty) return localizedPenaltyDescription(language, player, score);
  if (event.type === "score_update" && isAddedTimeEvent(event)) return localizedAddedTimeScore(language, score);
  if (event.type === "kickoff") {
    if (language === "zh") return "比赛已经开始，比分从 0-0 起步。";
    if (language === "es") return "Comienza el partido con el marcador 0-0.";
    if (language === "pt") return "A partida começou com o placar em 0-0.";
    if (language === "fr") return "Le match commence sur le score de 0-0.";
    if (language === "de") return "Das Spiel beginnt beim Stand von 0-0.";
    if (language === "ja") return "キックオフ。スコアは0-0から始まります。";
    if (language === "ar") return "بدأت المباراة والنتيجة 0-0.";
    return "Kickoff: the match starts at 0-0.";
  }
  if (event.type === "substitution" && !readablePlayer) {
    if (language === "zh") return "完成一次换人，场上阵容已调整。";
    if (language === "es") return "Se completó una sustitución y cambió la alineación en el campo.";
    if (language === "pt") return "Uma substituição foi concluída e a formação em campo mudou.";
    if (language === "fr") return "Un remplacement a été effectué et la composition sur le terrain a changé.";
    if (language === "de") return "Ein Wechsel wurde abgeschlossen und die Formation auf dem Feld angepasst.";
    if (language === "ja") return "選手交代が行われ、ピッチ上の構成が変わりました。";
    if (language === "ar") return "اكتمل تبديل وتغيّر التشكيل داخل الملعب.";
    return "A substitution was completed and the on-field lineup changed.";
  }
  if (language === "en") {
    if (event.type === "goal") return `${player} scored; the score is now ${score}.`;
    if (event.type === "yellow_card") return `${player} received a yellow card.`;
    if (event.type === "red_card") return `${player} received a red card; the number of players changed.`;
    if (event.type === "substitution") return `${player} was involved in a substitution.`;
    if (event.type === "halftime") return `Half-time; the score is ${score}.`;
    if (event.type === "fulltime") return `Full-time; the final score is ${score}.`;
    if (event.type === "odds_shift") return "The match momentum changed.";
    if (event.type === "score_update") return `The score is ${score}; play continues.`;
    return "The match continues.";
  }
  if (language === "zh") {
    if (event.type === "goal") return `${player}完成进球，比分更新为 ${score}。`;
    if (event.type === "yellow_card") return `${player}被出示黄牌，接下来的防守需要更谨慎。`;
    if (event.type === "red_card") return `${player}被出示红牌，比赛人数发生变化。`;
    if (event.type === "substitution") return `${player}参与换人，比赛节奏可能变化。`;
    if (event.type === "halftime") return `半场结束，当前比分 ${score}。`;
    if (event.type === "fulltime") return `全场结束，最终比分 ${score}。`;
    if (event.type === "odds_shift") return "比赛热度发生变化。";
    if (event.type === "score_update") return `当前比分 ${score}，比赛继续。`;
    return "比赛继续。";
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
    if (event.type === "yellow_card") return `${player} recibe tarjeta amarilla y deberá defender con más cuidado.`;
    if (event.type === "red_card") return `${player} recibe tarjeta roja; cambia el número de jugadores.`;
    if (event.type === "substitution") return `${player} participa en un cambio; el ritmo puede variar.`;
    if (event.type === "halftime") return `Descanso; el marcador es ${score}.`;
    if (event.type === "fulltime") return `Final; el marcador es ${score}.`;
    if (event.type === "odds_shift") return "Cambia el ritmo del partido.";
    if (event.type === "score_update") return `El marcador es ${score}; el juego continúa.`;
    return "El partido continúa.";
  }
  if (language === "pt") {
    if (event.type === "goal") return `${player} marca; o placar fica ${score}.`;
    if (event.type === "yellow_card") return `${player} recebe cartão amarelo e precisará defender com mais cuidado.`;
    if (event.type === "red_card") return `${player} recebe cartão vermelho; o número de jogadores muda.`;
    if (event.type === "substitution") return `${player} participa de uma substituição; o ritmo pode mudar.`;
    if (event.type === "halftime") return `Intervalo; o placar está ${score}.`;
    if (event.type === "fulltime") return `Fim de jogo; o placar é ${score}.`;
    if (event.type === "odds_shift") return "O ritmo do jogo mudou.";
    if (event.type === "score_update") return `O placar é ${score}; a partida continua.`;
    return "A partida continua.";
  }
  if (language === "fr") {
    if (event.type === "goal") return `${player} marque; le score passe à ${score}.`;
    if (event.type === "yellow_card") return `${player} reçoit un carton jaune et devra défendre avec plus de prudence.`;
    if (event.type === "red_card") return `${player} reçoit un carton rouge; le nombre de joueurs change.`;
    if (event.type === "substitution") return `${player} participe à un remplacement; le rythme peut évoluer.`;
    if (event.type === "halftime") return `Mi-temps; le score est ${score}.`;
    if (event.type === "fulltime") return `Fin du match; le score est de ${score}.`;
    if (event.type === "odds_shift") return "Le rythme du match évolue.";
    if (event.type === "score_update") return `Le score est de ${score}; le jeu continue.`;
    return "Le match continue.";
  }
  if (language === "de") {
    if (event.type === "goal") return `${player} trifft; der Stand ist ${score}.`;
    if (event.type === "yellow_card") return `${player} sieht Gelb und muss nun vorsichtiger verteidigen.`;
    if (event.type === "red_card") return `${player} sieht Rot; die Spielerzahl verändert sich.`;
    if (event.type === "substitution") return `${player} ist an einem Wechsel beteiligt; das Tempo kann sich ändern.`;
    if (event.type === "halftime") return `Halbzeit; der Stand ist ${score}.`;
    if (event.type === "fulltime") return `Abpfiff; der Endstand ist ${score}.`;
    if (event.type === "odds_shift") return "Die Spieldynamik verändert sich.";
    if (event.type === "score_update") return `Es steht ${score}; das Spiel läuft weiter.`;
    return "Das Spiel läuft weiter.";
  }
  if (language === "ja") {
    if (event.type === "goal") return `${player}が得点し、スコアは ${score} になりました。`;
    if (event.type === "yellow_card") return `${player}にイエローカード。これからの守備はより慎重さが必要です。`;
    if (event.type === "red_card") return `${player}にレッドカード。出場人数が変わります。`;
    if (event.type === "substitution") return `${player}が交代に関与。試合のテンポが変わる可能性があります。`;
    if (event.type === "halftime") return `ハーフタイム。スコアは ${score} です。`;
    if (event.type === "fulltime") return `試合終了。最終スコアは ${score} です。`;
    if (event.type === "odds_shift") return "試合の流れが変化しました。";
    if (event.type === "score_update") return `スコアは ${score}。試合は続きます。`;
    return "試合は続きます。";
  }
  if (event.type === "goal") return `${player} يسجل؛ النتيجة ${score}.`;
  if (event.type === "yellow_card") return `${player} يتلقى بطاقة صفراء وعليه الدفاع بحذر أكبر.`;
  if (event.type === "red_card") return `${player} يتلقى بطاقة حمراء؛ يتغير عدد اللاعبين.`;
  if (event.type === "substitution") return `${player} يشارك في تبديل؛ قد يتغير إيقاع المباراة.`;
  if (event.type === "halftime") return `نهاية الشوط الأول؛ النتيجة ${score}.`;
  if (event.type === "fulltime") return `النهاية؛ النتيجة ${score}.`;
  if (event.type === "odds_shift") return "تغير إيقاع المباراة.";
  if (event.type === "score_update") return `النتيجة ${score}؛ والمباراة مستمرة.`;
  return "تستمر المباراة.";
}

function eventMinuteLabel(event: MatchEvent, fallback: number) {
  const minute = Number.isFinite(event.minute) ? event.minute : fallback;
  return event.stoppage ? `${minute}+${event.stoppage}` : `${minute}`;
}

function isAddedTimeEvent(event: MatchEvent) {
  return event.minute > 90 || Boolean(event.stoppage);
}

function localizedAddedTimeLead(language: PulseLanguage) {
  if (language === "zh") return "补时阶段，";
  if (language === "es") return "En el tiempo añadido, ";
  if (language === "pt") return "Nos acréscimos, ";
  if (language === "fr") return "Dans le temps additionnel, ";
  if (language === "de") return "In der Nachspielzeit: ";
  if (language === "ja") return "アディショナルタイム、";
  if (language === "ar") return "في الوقت بدل الضائع، ";
  return "In added time, ";
}

function localizedPenaltyGoal(language: PulseLanguage, player: string, minute: string, score: string) {
  if (language === "zh") return `${minute}分钟，${player}主罚点球命中，比分更新为 ${score}。`;
  if (language === "es") return `${player} marca de penalti en el minuto ${minute}; el marcador es ${score}.`;
  if (language === "pt") return `${player} converte o pênalti aos ${minute} minutos; o placar é ${score}.`;
  if (language === "fr") return `${player} transforme le penalty à la ${minute}e minute; le score est ${score}.`;
  if (language === "de") return `${player} verwandelt den Elfmeter in Minute ${minute}; der Stand ist ${score}.`;
  if (language === "ja") return `${minute}分、${player}がペナルティーキックを決め、スコアは ${score} です。`;
  if (language === "ar") return `${player} يسجل من ركلة جزاء في الدقيقة ${minute}؛ النتيجة ${score}.`;
  return `${player} converted the penalty in minute ${minute}; the score is now ${score}.`;
}

function localizedPenaltyDescription(language: PulseLanguage, player: string, score: string) {
  if (language === "zh") return `${player}主罚点球命中，比分更新为 ${score}。`;
  if (language === "es") return `${player} marca de penalti; el marcador pasa a ${score}.`;
  if (language === "pt") return `${player} converte o pênalti; o placar fica ${score}.`;
  if (language === "fr") return `${player} transforme le penalty; le score passe à ${score}.`;
  if (language === "de") return `${player} verwandelt den Elfmeter; der Stand ist ${score}.`;
  if (language === "ja") return `${player}がペナルティーキックを決め、スコアは ${score} です。`;
  if (language === "ar") return `${player} يسجل من ركلة جزاء؛ النتيجة ${score}.`;
  return `${player} converted the penalty; the score is now ${score}.`;
}

function localizedAddedTimeScore(language: PulseLanguage, score: string) {
  if (language === "zh") return `进入补时阶段，当前比分 ${score}，比赛继续。`;
  if (language === "es") return `Ya en el tiempo añadido, el marcador es ${score} y el juego continúa.`;
  if (language === "pt") return `Nos acréscimos, o placar é ${score} e a partida continua.`;
  if (language === "fr") return `Dans le temps additionnel, le score est de ${score} et le jeu continue.`;
  if (language === "de") return `In der Nachspielzeit steht es ${score}; das Spiel läuft weiter.`;
  if (language === "ja") return `アディショナルタイムに入り、スコアは ${score}。試合は続きます。`;
  if (language === "ar") return `في الوقت بدل الضائع، النتيجة ${score} والمباراة مستمرة.`;
  return `Added time is under way; the score is ${score} and play continues.`;
}

function localizedWaiting(language: PulseLanguage, match: MatchData) {
  const home = localizeTeamName(match.home.code, match.home.name, language);
  const away = localizeTeamName(match.away.code, match.away.name, language);
  if (language === "zh") return `${home}对阵${away}，正等待开赛。`;
  if (language === "es") return `${home} contra ${away} espera el inicio.`;
  if (language === "pt") return `${home} contra ${away} aguarda o início.`;
  if (language === "fr") return `${home} contre ${away} attend le coup d'envoi.`;
  if (language === "de") return `${home} gegen ${away} wartet auf den Anpfiff.`;
  if (language === "ja") return `${home}対${away}はキックオフ待ちです。`;
  if (language === "ar") return `${home} ضد ${away} بانتظار البداية.`;
  return `${home} and ${away} await kickoff.`;
}

function teamLabel(language: PulseLanguage, code?: string) {
  if (!code) return undefined;
  if (code !== "HOME" && code !== "AWAY") return localizeTeamName(code, code, language);
  if (language === "zh") return code === "HOME" ? "主队" : "客队";
  if (language === "es") return code === "HOME" ? "Local" : "Visitante";
  if (language === "pt") return code === "HOME" ? "Mandante" : "Visitante";
  if (language === "fr") return code === "HOME" ? "Domicile" : "Extérieur";
  if (language === "de") return code === "HOME" ? "Heimteam" : "Auswärtsteam";
  if (language === "ja") return code === "HOME" ? "ホーム" : "アウェー";
  if (language === "ar") return code === "HOME" ? "صاحب الأرض" : "الضيف";
  return code === "HOME" ? "Home team" : "Away team";
}
