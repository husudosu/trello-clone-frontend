import moment from "moment-timezone";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// TODO: Create draft types, for example draft card
export interface UserLogin {
    username: string;
    password: string;
    remember_me?: boolean;
}

export interface User {
    id: Readonly<number>;
    username: string;
    name?: string;
    roles: Array<string>;
    avatar_url?: string;
    email: string;
    registered_date?: string;
    timezone: string;
}

export interface UserUpdate extends Omit<User, "roles"> {
    password?: string; // New password
    current_password: string | null;
}

export interface BoardList {
    id?: Readonly<number>;
    board_id: number;
    title: string;
    position: number;
    cards: Card[];
}

export interface Board {
    id: Readonly<number>;
    owner_id: number;
    title: string;
    lists: BoardList[];
    background_image?: string;
    background_color?: string;
}


export interface BoardRolePermission {
    id: Readonly<number>;
    name: string;
    allow: boolean;
}

export interface BoardRole {
    id: Readonly<number>;
    name: string;
    is_admin: boolean;
    permissions: BoardRolePermission[];
}

export interface BoardClaims {
    id: Readonly<number>;
    board_id: number;
    is_owner: boolean;
    user_id: number;
    role: BoardRole;
}

export interface Card {
    id?: Readonly<number>;
    list_id: number;
    owner_id?: number;
    title?: string;
    description?: string;
    due_date?: string;
    position?: number;
    activities?: CardActivity[];
}


export interface UserBasicInfo {
    id: Readonly<number>;
    name: string;
    avatar_url?: string;
    username: string;
    timezone: string;
}

export interface CardListChange {
    id: Readonly<number>;
    activity_id: number;
    from_list_id: number;
    to_list_id: number;
    from_list: Partial<BoardList>;
    to_list: Partial<BoardList>;
}

export interface CardActivity {
    id: Readonly<number>;
    card_id: number;
    user_id: number;
    activity_on: moment.Moment;
    entity_id?: number;
    event?: number;
    comment?: CardComment;
    list_change?: CardListChange;
    user?: UserBasicInfo;
}

export interface CardComment {
    id?: Readonly<number>;
    user_id?: number;
    card_id: number;
    comment: string | undefined;
    created?: moment.Moment;
    updated?: moment.Moment;
}

export interface RegisterPayload {
    email: string,
    username: string,
    password: string,
    name?: string,
    timezone: string,
}

export interface BoardAllowedUser {
    id: Readonly<number>;
    user_id: number;
    board_id: number;
    board_role_id: number;
    is_owner: boolean;
    role: BoardRole;
    user: UserBasicInfo;
}

export interface AddBoardMemberType {
    board_role_id: number;
    user_id: number;
}

export interface RemoveBoardMemberType {
    user_id: number;
}


export enum CardActivityEvent {
    CARD_ASSIGN_TO_LIST = 1,
    CARD_MOVE_TO_LIST = 2,
    CARD_COMMENT = 3,
}


export enum BoardPermission {
    CARD_EDIT = "card.edit",
    CARD_COMMENT = "card.comment",
    CARD_DELETE = "card.delete",
    LIST_CREATE = "list.create",
    LIST_EDIT = "list.edit",
    LIST_DELETE = "list.delete",
    BOARD_UPDATE = "board.update",
    BOARD_DELETE = "board.delete",
}