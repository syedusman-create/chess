export async function loadTraps(){
  try{
    const r = await fetch('./traps.json');
    if(!r.ok) throw new Error('not found');
    const data = await r.json();
    // If data items use `moves` (string) and `side_starts`, convert to {name, starts, winner, variations}
    if (Array.isArray(data) && data.length && (data[0].moves || data[0].side_starts)) {
      const sanRegex = /(O-O-O|O-O|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[+#]?|[a-h][1-8])/g;
      return data.map(item => {
        const movesStr = (item.moves || '').replace(/\[.*?\]/g, ' ');
        const matches = movesStr.match(sanRegex) || [];
        const tokens = matches.map(s => s.replace(/[,.]$/,'').trim());
        return {
          name: item.name || item.title || 'Unnamed',
          starts: (item.side_starts || item.starts || '').toString().toLowerCase(),
          winner: item.winner || null,
          variations: tokens.length ? [tokens] : []
        };
      });
    }
    return data;
  }catch(e){
    // fallback sample traps
    return [
      {name:'Fried Liver Attack', starts:'white', variations:[['e4','e5','Nf3','Nc6','Bc4','Nf6','Ng5','d5','exd5','Nxd5']]},
      {name:'Legal Trap', starts:'white', variations:[['e4','e5','Nf3','Nc6','Bc4','d6','Nc3','Bg4']]},
      {name:'Blackmar-Diemer', starts:'black', variations:[['d4','d5','Nc3','Nf6','Bg5','c6']]} 
    ];
  }
}
