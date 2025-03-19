import { AccountManager } from "applesauce-accounts";
import { registerCommonAccountTypes } from "applesauce-accounts/accounts";

// create an account manager instance
export const accounts = new AccountManager();

// Adds the common account types to the manager
registerCommonAccountTypes(accounts);

// persist accounts to local storage
const json = JSON.parse(localStorage.getItem("accounts") || "[]");
await accounts.fromJSON(json);
accounts.accounts$.subscribe(() => {
  localStorage.setItem("accounts", JSON.stringify(accounts.toJSON()));
});

// persist active account
if (localStorage.getItem("active")) {
  accounts.setActive(localStorage.getItem("active")!);
}
accounts.active$.subscribe((account) => {
  if (account) localStorage.setItem("active", account.id);
  else localStorage.removeItem("active");
});
