# Simplifi Mappings

Below are the mappings for the Simplifi import file format.

| Index | Column | Description                                                    |
|-------|--------|----------------------------------------------------------------|
| 0     | Date   | The date of the transaction in `MM/dd/yyyy` format.            |
| 1     | Payee  | Who was paid for this transaction.                             |
| 2     | Amount | Dollar amount paid to the person. Can be positive or negative. |
| 3     | Tags   | CSV of tags to apply to the transaction.                       |

:information-source: For Payee, we suggest doing some minimal formatting to reduce any extra spaces. Have
previously done this using an Excel function: `=REGEX(B8, "\s{2,}", " ", "g")`.