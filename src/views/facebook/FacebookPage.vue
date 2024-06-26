<template>
    <div class="absolute -top-2 right-0 my-6 mx-8">
        <div class="flex space-x-4">
            <Search />
            <ButtonBase class="flex !w-fit" @click="redirectToAddAccount">
                <img src="../../assets/icon-create.svg" alt="Create">
                <span class="ml-2">Add Account</span>
            </ButtonBase>
        </div>
    </div>
    <div>
        <TableExpandComponent class="mb-2" :table-header="tableHeader" :table-body="linkedList"
            :search-criteria="searchCriteria" :total-row="totalRow" @table-changed="loadData">
            <template #name="{slotProps}">
                <div class="p-2">
                    {{ slotProps.facebook_linked_name }}
                </div>
            </template>
        </TableExpandComponent>
    </div>
</template>

<script setup lang="ts">
import ButtonBase from '@/components/button/ButtonBase.vue';
import TableExpandComponent from '@/components/table/TableExpandComponent.vue';
import router from "@/router";
import { inject, onMounted, ref, watch, type Ref } from 'vue';
import { SearchCriteria, TableHeader } from '@/components/ComponentEntity';
import Search from '@/components/search/Search.vue';
import { FacebookLinked } from '@/entity/facebook/FacebookLinked';
import { GetFacebookLinkedUseCase } from '@/usecase/facebook/GetFacebookLinkedUseCase';
import { finalize, Subscription } from 'rxjs';
import { NotificationManager } from '@/util/NotificationManager';
import { useUserStore } from '@/stores/UserStore';
import { useRoute } from 'vue-router';
import { GetAccountUseCase } from '@/usecase/facebook/GetAccountUseCase';

const asyncSubscription: Subscription = new Subscription();

const searchCriteria: Ref<SearchCriteria> = ref({
    page: 1,
    rowPerPage: 10,
    sortKey: "name",
    sortOrder: "asc"
});

const tableHeader: Ref<TableHeader[]> = ref([
    {
        key: "name",
        name: "Account Name",
        isSortable: true
    },
    {
        key: "totalPageConnect",
        name: "Page Connect",
        isSortable: true
    },
    {
        key: "created_at",
        name: "Added",
        isSortable: true
    },
] as TableHeader[]);
const linkedList: Ref<FacebookLinked[]> = ref([]);
const totalRow: Ref<number> = ref(2);

const isLoading = ref(false);

const getFacebookLinkedUseCase: GetFacebookLinkedUseCase = inject("getFacebookLinkedUseCase")!;
const getAccountUseCase: GetAccountUseCase = inject("getAccountUseCase")!;

const route = useRoute();

function loadData(name=""): void {
    isLoading.value = true;

    asyncSubscription.add(
        getFacebookLinkedUseCase.execute({
            facebook_linked_name: name,
            limit: searchCriteria.value.rowPerPage,
            page: searchCriteria.value.page-1,
            sort_by: searchCriteria.value.sortKey.length > 0 ? `${searchCriteria.value.sortKey},${searchCriteria.value.sortOrder}` : "",
        }).pipe(
            finalize(() => isLoading.value = false)
        ).subscribe(
            {
                next: (getFacebookResp) => {
                    if (getFacebookResp.code === 200) {
                        linkedList.value = getFacebookResp.result.data.content.facebook_linked_list ?? [];
                        totalRow.value = getFacebookResp.result.data.total_elements ?? 0;
                    } else {
                        const message = getFacebookResp.result?.message ?? getFacebookResp.message;
                        NotificationManager.showMessage("Failed to Load Data", message, "error");
                    }
                },
                error: (error) => {
                    NotificationManager.showMessage("Network Error", error, "error");
                }
            }
        )
    )
}

function redirectToAddAccount(): void {
    const url = import.meta.env.VITE_API_URL + "/oauth2/authorization/facebook";
    window.location.href = url;
    // window.open(url, "add account", "width=200,height=200")
}

const userStore = useUserStore();

onMounted(() => {
    if (userStore.token) {
        loadData();

        if (route.query.code) {
            getNewFacebookPage(route.query.code as string)
        }
    }
})

function getNewFacebookPage(token: string): void {
    asyncSubscription.add(
        getAccountUseCase.execute({
            code: token
        }).subscribe(
            {
                next: (resp) => {
                    if (resp.code === 200) {
                        // Set store
                        userStore.setFacebookAccount(true);
                        // Route to facebook
                        router.push("/facebook");
                        // Reload data in table
                        loadData();
                    } else {
                        const message = resp.result?.message ?? resp.message;
                        NotificationManager.showMessage("Failed to Fetch New Page", message, "error");
                    }
                },
                error: (error) => {
                    NotificationManager.showMessage("Network Error", error, "error");
                }
            }
        )
    )
}

watch(route, (value) => {
    if (value.query.code) {
        getNewFacebookPage(value.query.code as string);
    }
}, {
    deep: true
});
</script>