const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  /className={cn\(\n                  "absolute top-0 left-1\/2 -translate-x-1\/2 -translate-y-1\/2 flex items-center gap-3 p-3 rounded-2xl backdrop-blur-md border shadow-2xl"/g,
  `className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                 <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: node.speed, repeat: Infinity, ease: "linear" }}
                   className={cn(
                     "flex items-center gap-3 p-3 rounded-2xl backdrop-blur-md border shadow-2xl",`
);

code = code.replace(
  /<span className="text-white font-medium text-sm whitespace-nowrap hidden sm:block">{node.label}<\/span>\n              <\/div>/g,
  `<span className="text-white font-medium text-sm whitespace-nowrap hidden sm:block">{node.label}</span>
                 </motion.div>
              </div>`
);

fs.writeFileSync('src/pages/Home.tsx', code);
