class OkxWallet {
  installled = false;
  connected = false;
  constructor() {
    this.init();
  }
  async init() {
    let okxwallet = window.okxwallet?.bitcoin;

    for (let i = 1; i < 10 && !okxwallet; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100 * i));
      okxwallet = window.okxwallet?.bitcoin;
    }

    if (okxwallet) {
      this.installled = true;
    } else if (!okxwallet) return;
    if (address) {
      return;
    }
    setTimeout(() => {
      if (okxwallet?.selectedAccount) {
        this.connected = true;
        walletType = 2;
        accountsChange(okxwallet?.selectedAccount?.address);
      }

      okxwallet.on("accountsChanged", function (_accounts) {
        accountsChange(_accounts[0]);
      });
    }, 1000);
  }

  getProvider() {
    return window.okxwallet?.bitcoin;
  }
  connnect() {
    return window.okxwallet?.bitcoin?.connect();
  }
}

class UniSatWallet {
  installled = false;
  connected = false;
  constructor() {
    this.init();
  }

  async init() {
    let unisat = window.unisat;

    for (let i = 1; i < 10 && !unisat; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100 * i));
      unisat = window.unisat;
    }

    if (unisat) {
      this.installled = true;
    } else if (!unisat) return;
    if (address) {
      return;
    }

    if (unisat._isConnected) {
      this.connected = true;
      walletType = 1;
      accountsChange(unisat._selectedAddress);
    }
    unisat.getAccounts().then((accounts) => {
      this.connected = true;
      walletType = 1;
      accountsChange(accounts[0]);
    });

    unisat.on("accountsChanged", function (accounts) {
      accountsChange(accounts[0]);
    });
    // unisat.on("networkChanged", handleNetworkChanged);
  }

  getProvider() {
    return window.unisat;
  }
  connnect() {
    return window.unisat?.requestAccounts();
  }
}

function accountsChange(account) {
  try {
    address = account;
    if (address) {
      document.getElementById("wallet-connect").innerHTML =
        address.substring(0, 5) +
        "****" +
        address.substring(address.length - 3);

      const tx = localStorage.getItem(address);
      if (tx) {
        document.getElementById("donate").style =
          "background: #ccc;pointer-events: none;";
      } else {
        document.getElementById("donate").style =
          "background-image: url(../img/farm_title.jpg);background-repeat: no-repeat;";
      }
      queryData(address);
    } else {
      document.getElementById("wallet-connect").innerHTML = "Connect Wallet";
    }
  } catch (error) {}
}
var address = "";
var isShowMenu = false;
var provider = null;
var unisatWallet = new UniSatWallet();
var okxWallet = new OkxWallet();
var walletType = 1;
function hideMenu() {
  var _menuEl = document.getElementById("wallets");
  if (isShowMenu) {
    isShowMenu = false;
    _menuEl.style.display = "none";
  }
}
async function unisatConnect() {
  if (unisatWallet.installled) {
    const res = await unisatWallet.connnect();
    walletType = 1;
    accountsChange(res[0]);
    provider = unisatWallet.getProvider();
  }

  hideMenu();
}
async function okxConnect() {
  if (okxWallet.installled) {
    const res = await okxWallet.connnect();
    accountsChange(res.address);
    provider = okxWallet.getProvider();
    walletType = 2;
  }

  hideMenu();
}
window.onload = function () {
  setTimeout(() => {
    unisatWallet.init();
    okxWallet.init();
  }, 500);

  function showMenu() {
    var _menuEl = document.getElementById("wallets");
    if (!isShowMenu) {
      isShowMenu = true;
      _menuEl.style.display = "block";
    }
  }
  document
    .getElementById("wallet-connect")
    .addEventListener("click", function (event) {
      if (isShowMenu) {
        hideMenu();
      } else {
        showMenu();
      }
      event.stopPropagation();
      return false;
    });
  queryData("asdasd");
};
async function queryData(_account) {
  try {
    const res = await axios.get(
      "https://api-dev.liferestart.net/donate/" + _account,
      {
        maxBodyLength: Infinity,
      }
    );

    if (res.status === 200) {
      if (Number(res.data.userCount) > 0) {
        document.getElementById("USER_PARTICIPANTS").innerText = 1;
      }
      if (
        Number(res.data.userCount) > 0 ||
        Number(res.data.totalCount) > 9999
      ) {
        document.getElementById("donate").style =
          "background: #ccc;pointer-events: none;";
      } else {
        document.getElementById("donate").style =
          "background-image: url('/assets/img/farm_title.jpg');background-repeat: no-repeat;";
      }
      // document.getElementById("TOTAL_DONATIONS").innerText = (
      //   Number(res.data.totalDeposit ?? 0) / 100000000
      // ).toFixed(2);
      document.getElementById("TOTAL_DONATIONS").innerText = (
        Number(10000) * 0.0029
        // Number(res.data.totalCount ?? 0) * 0.0029
      ).toFixed(2);
      document.getElementById("PARTICIPANTS").innerText = 10000;
      // document.getElementById("PARTICIPANTS").innerText = res.data.totalCount;
    }
  } catch (error) {
    console.log(error);
  }
}
const toAddress =
  "bc1pv9m4djv235k3v392z5hwk4p2wch7fxfp5xelhadjszn6khcq6xqqklzev0";

function changeButtonState() {
  document.getElementById("USER_PARTICIPANTS").innerText = 1;
  document.getElementById("donate").style =
    "background: #ccc;pointer-events: none;";
}
async function donate() {
  const _modalEl = document.getElementById("modal-wrap");
  if (walletType === 2) {
    provider = okxWallet.getProvider();
  } else if (unisatWallet.connected) {
    provider = unisatWallet.getProvider();
  }
  if (!provider) return;
  if (walletType === 2) {
    try {
      let txid = await provider?.send({
        from: address,
        to: toAddress,
        value: "0.0033",
      });

      localStorage.setItem(address, txid);
      changeButtonState();
      _modalEl.style.display = "flex";
      setTimeout(() => {
        _modalEl.style.display = "none";
        queryData(address);
      }, 5000);
    } catch (e) {
      console.log(e);
    }
  } else {
    try {
      let txid = await provider?.sendBitcoin(toAddress, 330000);
      changeButtonState();
      localStorage.setItem(address, txid);
      _modalEl.style.display = "flex";
      setTimeout(() => {
        _modalEl.style.display = "none";
        queryData(address);
      }, 5000);
    } catch (e) {
      console.log(e);
    }
  }
}
