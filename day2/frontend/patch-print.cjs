const fs = require('fs');
const path = require('path');

const file = 'c:/Users/sohaa/Downloads/intranship projects/day2/frontend/src/components/TodoPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states for print modal
content = content.replace(
  /const \[showListOptions, setShowListOptions\] = useState\(false\);\n  const listOptionsRef = useRef<HTMLDivElement>\(null\);/,
  `const [showListOptions, setShowListOptions] = useState(false);
  const listOptionsRef = useRef<HTMLDivElement>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printSteps, setPrintSteps] = useState(true);
  const [printNotes, setPrintNotes] = useState(true);

  function handlePrint() {
    if (!printNotes) document.body.classList.add('no-print-notes');
    if (!printSteps) document.body.classList.add('no-print-steps');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('no-print-notes');
      document.body.classList.remove('no-print-steps');
      setShowPrintModal(false);
    }, 500);
  }`
);

// 2. Change Print list button behavior
content = content.replace(
  /<button className="ms-list-option-btn" onClick=\{\(\) => \{ setShowListOptions\(false\); window\.print\(\); \}\}>/,
  `<button className="ms-list-option-btn" onClick={() => { setShowListOptions(false); setShowPrintModal(true); }}>`
);

// 3. Add Print Modal JSX at the end of TodoPage component, before the closing </TodoPage> tag
// Let's find the closing tag of the component return: `    </>\n  );\n}\n`
content = content.replace(
  /    <\/>\n  \);\n\}\n/,
  `      {showPrintModal && (
        <div className="ms-modal-overlay">
          <div className="ms-print-modal">
            <div className="ms-print-modal-header">
              <h3>Print options</h3>
              <button className="ms-print-modal-close" onClick={() => setShowPrintModal(false)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 1L13 13M1 13L13 1" />
                </svg>
              </button>
            </div>
            <div className="ms-print-modal-body">
              <div className="ms-print-toggle-row">
                <span>Print steps</span>
                <div className="ms-toggle-switch" onClick={() => setPrintSteps(!printSteps)}>
                  <div className={\`ms-toggle-track \${printSteps ? 'on' : 'off'}\`}>
                    <div className="ms-toggle-thumb" />
                  </div>
                  <span className="ms-toggle-label">{printSteps ? 'On' : 'Off'}</span>
                </div>
              </div>
              <div className="ms-print-toggle-row">
                <span>Print notes</span>
                <div className="ms-toggle-switch" onClick={() => setPrintNotes(!printNotes)}>
                  <div className={\`ms-toggle-track \${printNotes ? 'on' : 'off'}\`}>
                    <div className="ms-toggle-thumb" />
                  </div>
                  <span className="ms-toggle-label">{printNotes ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
            <div className="ms-print-modal-footer">
              <button className="ms-print-btn-primary" onClick={handlePrint}>Print</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched TodoPage.tsx for Print Modal');
