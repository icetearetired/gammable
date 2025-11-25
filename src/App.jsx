import { useState, useRef, useEffect } from "react";
import Modal from "./components/modal";
import JOBS_DATA from "./data/jobs";
import "./App.css";

const SYMBOLS = ["🍒", "💎", "⭐", "7️⃣", "💵"];

export default function App() {
  const [state, setState] = useState({ money: 50, bank: 0, loan: 0 });
  const [jobs, setJobs] = useState(JOBS_DATA);
  const [slots, setSlots] = useState(["---", "---", "---"]);
  const [bet, setBet] = useState("");
  const [msg, setMsg] = useState("Welcome — press Spin.");
  const [highlight, setHighlight] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  const reel1 = useRef(null);
  const reel2 = useRef(null);
  const reel3 = useRef(null);

  // Load save
  useEffect(() => {
    const load = localStorage.getItem("gamble_react_codespace");
    if (!load) return;
    try {
      const d = JSON.parse(load);
      setState(d.state || state);
      setJobs(d.jobs || jobs);
    } catch {
      console.warn("Load failed");
    }
  }, []);

  const saveGame = () => {
    localStorage.setItem("gamble_react_codespace", JSON.stringify({ state, jobs }));
    setMsg("Game saved 🔥");
  };

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const jobPay = (job) => {
    const [name, minB, maxB, lvl] = job;
    return [minB + (lvl - 1) * 3, maxB + (lvl - 1) * 5];
  };

  const doWork = (id) => {
    setJobs((prev) => {
      let copy = { ...prev };
      let job = [...copy[id]];

      const [min, max] = jobPay(job);
      const pay = Math.floor(Math.random() * (max - min + 1)) + min;

      job[4] += 1;
      let m = `Worked ${job[0]} +$${pay}`;
      if (job[4] >= 3) {
        job[4] = 0;
        job[3]++;
        m += ` | LEVEL UP → ${job[3]}`;
      }

      copy[id] = job;
      setState((s) => ({ ...s, money: s.money + pay }));
      setMsg(m);
      return copy;
    });

    setModalOpen(false);
  };

  const bankAction = (action, amt) => {
    const amount = parseInt(amt);
    if (!amount || amount <= 0) return setMsg("Invalid amount lil bro");

    setState((s) => {
      let st = { ...s };

      switch (action) {
        case "deposit":
          if (amount <= st.money) {
            st.money -= amount;
            st.bank += amount;
            setMsg(`Deposited $${amount}`);
          } else setMsg("You broke gang");
          break;
        case "withdraw":
          if (amount <= st.bank) {
            st.bank -= amount;
            st.money += amount;
            setMsg(`Withdrew $${amount}`);
          } else setMsg("Bank empty lil bro");
          break;
        case "loan":
          if (st.loan > 0) {
            setMsg("You already owe money 😭");
          } else if (amount > 200) {
            setMsg("Max loan $200");
          } else {
            st.money += amount;
            st.loan = amount + Math.floor(amount * 0.25);
            setMsg(`Borrowed $${amount}. Repay ${st.loan}`);
          }
          break;
        case "repay":
          if (amount > st.money) {
            setMsg("You don't even got that much 💀");
          } else {
            st.money -= amount;
            st.loan -= amount;
            if (st.loan < 0) st.loan = 0;
            setMsg(`Paid $${amount}. Remaining ${st.loan}`);
          }
          break;
      }

      return st;
    });

    setModalOpen(false);
  };

  const spin = () => {
    const b = parseInt(bet);
    if (!b || b <= 0) return setMsg("Enter a real bet lil bro");

    reel1.current.classList.add("spin");
    reel2.current.classList.add("spin");
    reel3.current.classList.add("spin");

    setMsg("Spinning...");

    const final = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    ];

    setTimeout(() => {
      setSlots([final[0], slots[1], slots[2]]);
      reel1.current.classList.remove("spin");
    }, 360);

    setTimeout(() => {
      setSlots([final[0], final[1], slots[2]]);
      reel2.current.classList.remove("spin");
    }, 620);

    setTimeout(() => {
      setSlots(final);
      reel3.current.classList.remove("spin");

      if (final[0] === final[1] && final[1] === final[2]) {
        const win = b * 5;
        setState((s) => ({ ...s, money: s.money + win }));
        setMsg(`JACKPOT! +$${win}`);
        setHighlight("win");
      } else if (
        final[0] === final[1] ||
        final[1] === final[2] ||
        final[0] === final[2]
      ) {
        const win = b * 2;
        setState((s) => ({ ...s, money: s.money + win }));
        setMsg(`Small win +$${win}`);
        setHighlight("win");
      } else {
        setState((s) => ({ ...s, money: s.money - b }));
        setMsg(`Lost -$${b}`);
        setHighlight("lose");
      }

      setTimeout(() => setHighlight(""), 1200);
    }, 1000);
  };

  return (
    <div className="App">
      <h1>React Gamble (Codespace Edition)</h1>

      <div className="stats">
        <p>Money: ${state.money}</p>
        <p>Bank: ${state.bank}</p>
        <p>Loan: ${state.loan}</p>
        <p>Net: ${state.money + state.bank - state.loan}</p>
      </div>

      <div className="actions">
        <button
          onClick={() =>
            openModal(
              "Choose a Job",
              <div className="popup-actions">
                {Object.keys(jobs).map((id) => (
                  <button
                    key={id}
                    className="popup-action-btn"
                    onClick={() => doWork(id)}
                  >
                    {jobs[id][0]}
                  </button>
                ))}
              </div>
            )
          }
        >
          Work
        </button>

        <button
          onClick={() =>
            openModal(
              "Bank",
              <div className="bank-menu">
                {["deposit", "withdraw", "loan", "repay"].map((act) => (
                  <BankInput
                    key={act}
                    action={act}
                    onSubmit={bankAction}
                  />
                ))}
              </div>
            )
          }
        >
          Bank
        </button>

        <button onClick={saveGame}>Save</button>

        <button
          onClick={() =>
            openModal(
              "Job Stats",
              <div>
                {Object.keys(jobs).map((id) => {
                  const j = jobs[id];
                  return (
                    <p key={id}>
                      {j[0]} — Level {j[3]} ({j[4]}/3)
                    </p>
                  );
                })}
              </div>
            )
          }
        >
          Job Stats
        </button>
      </div>

      <div className="slots">
        <div ref={reel1} className="reel">
          <span>{slots[0]}</span>
        </div>
        <div ref={reel2} className="reel">
          <span>{slots[1]}</span>
        </div>
        <div ref={reel3} className="reel">
          <span>{slots[2]}</span>
        </div>
      </div>

      <div className="bet">
        <input
          type="number"
          value={bet}
          placeholder="Bet amount"
          onChange={(e) => setBet(e.target.value)}
        />
        <button className="spin-btn" onClick={spin}>
          Spin
        </button>
      </div>

      <p className="message">{msg}</p>

      <Modal open={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>
    </div>
  );
}

function BankInput({ action, onSubmit }) {
  const [val, setVal] = useState("");

  return (
    <div className="bank-row">
      <input
        type="number"
        placeholder={action}
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <button onClick={() => onSubmit(action, val)}>{action}</button>
    </div>
  );
}
