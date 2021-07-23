/**
 * Statut de connexion
 */
enum Presence {
    AWAY = "away",
    BUSY = "busy",
    OFFLINE = "offline",
    ONLINE = "online",
    UNKNOWN = "unknown",
}

function presenceToReadableInfos(presence: Presence): { badgeColor: string, status: string } {
    let badgeColor: string;
    let status: string;

    switch (presence) {
        case Presence.AWAY:
            badgeColor = "warning";
            status = "Absent";
            break;

        case Presence.BUSY:
            badgeColor = "danger";
            status = "Occupé";
            break;

        case Presence.ONLINE:
            badgeColor = "success";
            status = "En ligne";
            break;


        case Presence.OFFLINE:
            badgeColor = "secondary";
            status = "Hors-ligne";
            break;

        case Presence.UNKNOWN:
        default:
            badgeColor = "secondary";
            status = "Inconnu";
            break;
    }

    return {
        badgeColor,
        status,
    };
}

export {
    Presence,
    presenceToReadableInfos,
};
