import * as Infrastructure from "cqrs-es-spec-kit-js-infrastructure";
import * as E from "fp-ts/lib/Either";
import * as U from "ulidx";

const USER_ACCOUNT_PREFIX = "UserAccount";
const UserAccountIdTypeSymbol = Symbol("UserAccountId");

class UserAccountId {
  readonly symbol: typeof UserAccountIdTypeSymbol = UserAccountIdTypeSymbol;
  readonly typeName = USER_ACCOUNT_PREFIX;

  private constructor(public readonly value: string) {}

  toJSON() {
    return {
      value: this.value,
    };
  }

  equals(anotherId: UserAccountId): boolean {
    return this.value === anotherId.value;
  }

  asString(): string {
    return `${USER_ACCOUNT_PREFIX}-${this.value}`;
  }

  toString(): string {
    return `UserAccountId(${this.value})`;
  }

  static validate(value: string): E.Either<string, UserAccountId> {
    try {
      return E.right(UserAccountId.of(value));
    } catch (error) {
      if (error instanceof Error) {
        return E.left(error.message);
      }
      throw error;
    }
  }

  static of(value: string): UserAccountId {
    const ulid = value.startsWith(`${USER_ACCOUNT_PREFIX}-`) ? value.substring(USER_ACCOUNT_PREFIX.length + 1) : value;
    if (U.isValid(ulid)) {
      return new UserAccountId(ulid);
    }
    throw new Error("Invalid user account id");
  }

  static generate(): UserAccountId {
    return new UserAccountId(Infrastructure.generateULID());
  }
}

// biome-ignore lint/suspicious/noExplicitAny:
function convertJSONToUserAccountId(json: any): UserAccountId {
  return UserAccountId.of(json.value);
}

export { UserAccountId, UserAccountIdTypeSymbol, convertJSONToUserAccountId };
