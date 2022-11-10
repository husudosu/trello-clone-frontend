import moment from "moment-timezone";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;


export interface PaginatedLinks {
    first: string;
    last: string;
}

export interface PaginatedResponse {
    links: PaginatedLinks;
    page: number;
    pages: number;
    per_page: number;
    total: number;
}

export interface PaginatedQuery {
    page?: number;
    per_page?: number;
    sort_by?: number;
    order?: "asc" | "desc";
}

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


export interface DraftBoardList {
    board_id: number;
    title: string;
}

export interface BoardList {
    id: Readonly<number>;
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


export interface DraftCard {
    title: string;
    list_id: number;
}

export interface Card {
    id: Readonly<number>;
    list_id: number;
    title: string;
    description?: string;
    position?: number;
    checklists: CardChecklist[];
    assigned_members: CardMember[];
    dates: CardDate[];
    activities: CardActivity[];
}


export interface DraftCardDate {
    dt_from?: string;
    dt_to: string | null;
    description?: string;
    complete: boolean;
}

export interface CardDate {
    id: Readonly<number>;
    card_id: Readonly<number>;
    dt_from?: moment.Moment | null;
    dt_to: moment.Moment;
    description?: string;
    complete: boolean;
}

export interface DraftCardMember {
    board_user_id: number;
    send_notification: boolean;
}

export interface CardMember {
    id: Readonly<number>;
    board_user: BoardMemberInfo;
    board_user_id: number;
    send_notification: boolean;
}

export interface UserBasicInfo {
    id: Readonly<number>;
    name: string;
    avatar_url?: string;
    username: string;
    timezone: string;
}

export interface BoardMemberInfo {
    id: Readonly<number>;
    user: UserBasicInfo;
    is_deleted: boolean;
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
    board_user_id: number;
    activity_on: moment.Moment;
    entity_id?: number;
    event?: number;
    comment?: CardComment;
    list_change?: CardListChange;
    board_user: BoardMemberInfo;
    changes: any;
}

export interface PaginatedCardActivity extends PaginatedResponse {
    data: CardActivity[];
}

export type CardActivityQueryType = "all" | "comment";

export interface CardActivityQueryParams extends PaginatedQuery {
    type?: CardActivityQueryType;
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
    is_deleted: boolean;
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


export interface ChecklistItem {
    id: Readonly<number>;
    checklist_id: Readonly<number>;
    marked_complete_board_user_id?: number;
    assigned_user_id?: number;

    title: string;
    due_date?: moment.Moment;
    completed: boolean;
    marked_complete_on?: moment.Moment;
    marked_complete_user?: BoardMemberInfo;
    assigned_user?: BoardMemberInfo;
    position?: number;
}


export type DraftChecklistItem = Optional<ChecklistItem, "id" | "checklist_id" | "completed">;

export interface CardChecklist {
    id: Readonly<number>;
    card_id: Readonly<number>;
    title?: string;
    items: ChecklistItem[];
}


export enum CardActivityEvent {
    CARD_ASSIGN_TO_LIST = 1,
    CARD_MOVE_TO_LIST = 2,
    CARD_COMMENT = 3,
    CHECKLIST_CREATE = 4,
    CHECKLIST_UPDATE = 5,
    CHECKLIST_DELETE = 6,
    CHECKLIST_ITEM_MARKED = 7,
    CHECKLIST_ITEM_DUE_DATE = 8,
    CHECKLIST_ITEM_USER_ASSIGN = 9,
    CARD_ASSIGN_MEMBER = 10,
    CARD_DEASSIGN_MEMBER = 11,
    CARD_ADD_DATE = 12,
    CARD_EDIT_DATE = 13,
    CARD_DELETE_DATE = 14,
}


export enum BoardPermission {
    CARD_EDIT = "card.edit",
    CARD_COMMENT = "card.comment",
    CARD_DELETE = "card.delete",
    CARD_ASSIGN_MEMBER = "card.assign_member",
    CARD_DEASSIGN_MEMBER = "card.deassign_member",
    CARD_ADD_DATE = "card.add_date",
    CARD_EDIT_DATE = "card.edit_date",
    LIST_CREATE = "list.create",
    LIST_EDIT = "list.edit",
    LIST_DELETE = "list.delete",
    BOARD_UPDATE = "board.update",
    BOARD_DELETE = "board.delete",
    CHECKLIST_CREATE = "checklist.create",
    CHECKLIST_EDIT = "checklist.edit",
    CHECKLIST_ITEM_MARK = "checklist_item.mark",

}